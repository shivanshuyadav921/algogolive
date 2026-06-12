import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ExecutionFeedback,
  FeedbackService,
} from '../feedback/feedback.service';

export interface ExecuteRequest {
  code: string;
  language: string; // 'python' | 'cpp' | 'javascript' | 'java'
  testCases: Array<{ input: string; output: string }>;
  pattern?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
}

export interface ExecuteResponse {
  success: boolean;
  results: TestResult[];
  compileError?: string;
  feedback?: ExecutionFeedback;
}

@Injectable()
export class SandboxService {
  private readonly tempDir = path.join(process.cwd(), 'temp_submissions');

  constructor(private readonly feedbackService: FeedbackService) {
    // Ensure temp execution directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async runCode(req: ExecuteRequest): Promise<ExecuteResponse> {
    const runId = uuidv4();
    const { code, language, testCases } = req;
    
    // We create a folder for this execution
    const runDir = path.join(this.tempDir, runId);
    fs.mkdirSync(runDir, { recursive: true });

    try {
      let response: ExecuteResponse;
      if (language === 'python') {
        response = await this.runPython(runDir, code, testCases);
      } else if (language === 'javascript') {
        response = await this.runJavaScript(runDir, code, testCases);
      } else if (language === 'cpp') {
        response = await this.runCpp(runDir, code, testCases);
      } else if (language === 'java') {
        response = await this.runJava(runDir, code, testCases);
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }
      return {
        ...response,
        feedback: this.feedbackService.evaluateExecution({
          ...response,
          pattern: req.pattern,
        }),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sandbox execution error';
      const response = {
        success: false,
        results: [],
        compileError: message,
      };
      return {
        ...response,
        feedback: this.feedbackService.evaluateExecution({
          ...response,
          pattern: req.pattern,
        }),
      };
    } finally {
      // Clean up workspace
      try {
        fs.rmSync(runDir, { recursive: true, force: true });
      } catch (rmError) {
        console.error('Failed to cleanup temp submission folder:', rmError);
      }
    }
  }

  private runPython(runDir: string, code: string, testCases: any[]): Promise<ExecuteResponse> {
    return new Promise((resolve) => {
      const filePath = path.join(runDir, 'solution.py');

      // Append standard runner skeleton that reads from sys.stdin
      const runnerCode = `
import sys
import json

${code}

def main():
    try:
        # We assume the user's entry point is named appropriately
        # Let's read arguments from stdin lines
        lines = sys.stdin.read().strip().split('\\n')
        if not lines or lines[0] == '':
            return
        
        # Determine the function name from code heuristics or standard conventions
        # For simplicity, call twoSum, search, isValid, longestCommonSubsequence
        # matching our seeded exercises.
        import inspect
        funcs = [obj for name, obj in globals().items() if inspect.isfunction(obj) and name != 'main']
        if not funcs:
            print("Error: No solution function declared.")
            return
        
        func = funcs[0]
        
        # Parse arguments
        parsed_args = []
        for line in lines:
            try:
                parsed_args.append(json.loads(line))
            except:
                # Fallback to string if JSON parsing fails
                parsed_args.append(line)
        
        result = func(*parsed_args)
        print(json.dumps(result))
    except Exception as e:
        print(f"Exception: {str(e)}", file=sys.stderr)

if __name__ == '__main__':
    main()
`;

      fs.writeFileSync(filePath, runnerCode);
      const results: TestResult[] = [];
      let index = 0;

      const runNextTest = () => {
        if (index >= testCases.length) {
          resolve({ success: results.every(r => r.passed), results });
          return;
        }

        const tc = testCases[index];
        const pyProc = spawn('python', [filePath], { timeout: 2000 });

        let stdout = '';
        let stderr = '';

        pyProc.stdin.write(tc.input);
        pyProc.stdin.end();

        pyProc.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pyProc.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pyProc.on('close', (code) => {
          const cleanOutput = stdout.trim();
          const cleanExpected = tc.output.trim();
          const passed = cleanOutput === cleanExpected;
          
          results.push({
            passed,
            input: tc.input,
            expected: cleanExpected,
            actual: cleanOutput || 'No output',
            error: stderr || undefined,
          });

          index++;
          runNextTest();
        });
      };

      runNextTest();
    });
  }

  private runJavaScript(runDir: string, code: string, testCases: any[]): Promise<ExecuteResponse> {
    return new Promise((resolve) => {
      const filePath = path.join(runDir, 'solution.js');
      
      const runnerCode = `
const fs = require('fs');

${code}

function main() {
    try {
        const input = fs.readFileSync(0, 'utf-8').trim();
        const lines = input.split('\\n');
        
        // Find user declared function
        // Check functions named twoSum, search, isValid, longestCommonSubsequence
        let func = null;
        if (typeof twoSum === 'function') func = twoSum;
        else if (typeof search === 'function') func = search;
        else if (typeof isValid === 'function') func = isValid;
        else if (typeof longestCommonSubsequence === 'function') func = longestCommonSubsequence;
        
        if (!func) {
            console.error("Error: No solution function declared.");
            process.exit(1);
        }

        const parsedArgs = lines.map(line => {
            try { return JSON.parse(line); }
            catch(e) { return line; }
        });

        const result = func(...parsedArgs);
        console.log(JSON.stringify(result));
    } catch (e) {
        console.error("Exception:", e.message);
        process.exit(1);
    }
}

main();
`;

      fs.writeFileSync(filePath, runnerCode);
      const results: TestResult[] = [];
      let index = 0;

      const runNextTest = () => {
        if (index >= testCases.length) {
          resolve({ success: results.every(r => r.passed), results });
          return;
        }

        const tc = testCases[index];
        const nodeProc = spawn('node', [filePath], { timeout: 2000 });

        let stdout = '';
        let stderr = '';

        nodeProc.stdin.write(tc.input);
        nodeProc.stdin.end();

        nodeProc.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        nodeProc.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        nodeProc.on('close', (code) => {
          const cleanOutput = stdout.trim();
          const cleanExpected = tc.output.trim();
          const passed = cleanOutput === cleanExpected;

          results.push({
            passed,
            input: tc.input,
            expected: cleanExpected,
            actual: cleanOutput || 'No output',
            error: stderr || undefined,
          });

          index++;
          runNextTest();
        });
      };

      runNextTest();
    });
  }

  private runCpp(runDir: string, code: string, testCases: any[]): Promise<ExecuteResponse> {
    return new Promise((resolve) => {
      const sourcePath = path.join(runDir, 'solution.cpp');
      const binPath = path.join(runDir, 'solution.exe');

      // Append standard C++ driver mapping stdin parsing
      const driverCode = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

${code}

int main() {
    // Basic dynamic routing wrapper for typical seeded problem types
    // Let's implement static solution router for twoSum or binary-search
    Solution solver;
    std::string line1, line2;
    if (std::getline(std::cin, line1)) {
        // Simple manual vector parsing for twoSum/search
        if (line1[0] == '[') {
            std::vector<int> nums;
            std::stringstream ss(line1);
            char ch;
            int val;
            ss >> ch; // read '['
            while (ss >> val) {
                nums.push_back(val);
                ss >> ch; // read ',' or ']'
                if (ch == ']') break;
            }
            if (std::getline(std::cin, line2)) {
                int target = std::stoi(line2);
                
                // Let's check if solution is vector twoSum or int search
                // For demonstration, let's call twoSum
                std::vector<int> res = solver.twoSum(nums, target);
                if (!res.empty()) {
                    std::cout << "[" << res[0] << "," << res[1] << "]" << std::endl;
                } else {
                    int searchRes = solver.search(nums, target);
                    std::cout << searchRes << std::endl;
                }
            }
        } else if (line1[0] == '"') {
            // String input (Valid Parentheses or LCS)
            line1.erase(std::remove(line1.begin(), line1.end(), '"'), line1.end());
            if (std::getline(std::cin, line2)) {
                line2.erase(std::remove(line2.begin(), line2.end(), '"'), line2.end());
                int lcsRes = solver.longestCommonSubsequence(line1, line2);
                std::cout << lcsRes << std::endl;
            } else {
                bool isValidRes = solver.isValid(line1);
                std::cout << (isValidRes ? "true" : "false") << std::endl;
            }
        }
    }
    return 0;
}
`;

      fs.writeFileSync(sourcePath, driverCode);

      // Compile
      exec(`g++ -O3 "${sourcePath}" -o "${binPath}"`, { timeout: 5000 }, (compileError, stdout, stderr) => {
        if (compileError) {
          resolve({
            success: false,
            results: [],
            compileError: stderr || compileError.message,
          });
          return;
        }

        const results: TestResult[] = [];
        let index = 0;

        const runNextTest = () => {
          if (index >= testCases.length) {
            resolve({ success: results.every(r => r.passed), results });
            return;
          }

          const tc = testCases[index];
          const cppProc = spawn(binPath, [], { timeout: 2000 });

          let cppStdout = '';
          let cppStderr = '';

          cppProc.stdin.write(tc.input + '\n');
          cppProc.stdin.end();

          cppProc.stdout.on('data', (data) => {
            cppStdout += data.toString();
          });

          cppProc.stderr.on('data', (data) => {
            cppStderr += data.toString();
          });

          cppProc.on('close', (code) => {
            const cleanOutput = cppStdout.trim();
            const cleanExpected = tc.output.trim();
            const passed = cleanOutput === cleanExpected;

            results.push({
              passed,
              input: tc.input,
              expected: cleanExpected,
              actual: cleanOutput || 'No output',
              error: cppStderr || undefined,
            });

            index++;
            runNextTest();
          });
        };

        runNextTest();
      });
    });
  }

  private runJava(runDir: string, code: string, testCases: any[]): Promise<ExecuteResponse> {
    return new Promise((resolve) => {
      const sourcePath = path.join(runDir, 'Main.java');

      const driverCode = `
import java.io.*;
import java.util.*;

${code}

public class Main {
    private static int[] parseIntArray(String raw) {
        String cleaned = raw.trim().replace("[", "").replace("]", "");
        if (cleaned.isEmpty()) return new int[0];
        String[] parts = cleaned.split(",");
        int[] values = new int[parts.length];
        for (int i = 0; i < parts.length; i++) values[i] = Integer.parseInt(parts[i].trim());
        return values;
    }

    private static String formatIntArray(int[] values) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < values.length; i++) {
            if (i > 0) builder.append(",");
            builder.append(values[i]);
        }
        return builder.append("]").toString();
    }

    private static String unquote(String raw) {
        return raw.trim().replaceAll("^\\\\\\"|\\\\\\"$", "");
    }

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String first = reader.readLine();
        if (first == null) return;
        String second = reader.readLine();
        Solution solution = new Solution();

        if (first.trim().startsWith("[")) {
            int[] nums = parseIntArray(first);
            int target = Integer.parseInt(second.trim());
            try {
                Object result = Solution.class.getMethod("twoSum", int[].class, int.class).invoke(solution, nums, target);
                System.out.println(formatIntArray((int[]) result));
            } catch (NoSuchMethodException error) {
                Object result = Solution.class.getMethod("search", int[].class, int.class).invoke(solution, nums, target);
                System.out.println(result);
            }
            return;
        }

        String text1 = unquote(first);
        if (second == null) {
            Object result = Solution.class.getMethod("isValid", String.class).invoke(solution, text1);
            System.out.println(result);
        } else {
            Object result = Solution.class.getMethod("longestCommonSubsequence", String.class, String.class).invoke(solution, text1, unquote(second));
            System.out.println(result);
        }
    }
}
`;

      fs.writeFileSync(sourcePath, driverCode);

      exec(`javac "${sourcePath}"`, { timeout: 5000 }, (compileError, stdout, stderr) => {
        if (compileError) {
          resolve({
            success: false,
            results: [],
            compileError: stderr || compileError.message,
          });
          return;
        }

        const results: TestResult[] = [];
        let index = 0;

        const runNextTest = () => {
          if (index >= testCases.length) {
            resolve({ success: results.every(r => r.passed), results });
            return;
          }

          const tc = testCases[index];
          const javaProc = spawn('java', ['-cp', runDir, 'Main'], { timeout: 2000 });

          let javaStdout = '';
          let javaStderr = '';

          javaProc.stdin.write(tc.input + '\n');
          javaProc.stdin.end();

          javaProc.stdout.on('data', (data) => {
            javaStdout += data.toString();
          });

          javaProc.stderr.on('data', (data) => {
            javaStderr += data.toString();
          });

          javaProc.on('close', () => {
            const cleanOutput = javaStdout.trim();
            const cleanExpected = tc.output.trim();
            const passed = cleanOutput === cleanExpected;

            results.push({
              passed,
              input: tc.input,
              expected: cleanExpected,
              actual: cleanOutput || 'No output',
              error: javaStderr || undefined,
            });

            index++;
            runNextTest();
          });
        };

        runNextTest();
      });
    });
  }
}
