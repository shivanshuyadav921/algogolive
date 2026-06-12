import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { VisualizerModule } from './visualizer/visualizer.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { ProblemsModule } from './problems/problems.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { LearningSessionsModule } from './learning-sessions/learning-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    VisualizerModule,
    SandboxModule,
    ProblemsModule,
    UsersModule,
    NotesModule,
    IngestionModule,
    LearningSessionsModule,
  ],
})
export class AppModule {}
