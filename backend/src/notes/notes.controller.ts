import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':userId')
  async getNotes(@Param('userId') userId: string) {
    return this.notesService.getUserNotes(userId);
  }

  @Post(':userId')
  async saveNote(
    @Param('userId') userId: string,
    @Body('problemId') problemId: string,
    @Body('content') content: string,
  ) {
    return this.notesService.saveNote(userId, problemId, content);
  }

  @Delete(':userId/:problemId')
  async deleteNote(
    @Param('userId') userId: string,
    @Param('problemId') problemId: string,
  ) {
    return this.notesService.deleteNote(userId, problemId);
  }

  @Post(':userId/bookmark')
  async toggleBookmark(
    @Param('userId') userId: string,
    @Body('problemId') problemId: string,
  ) {
    return this.notesService.toggleBookmark(userId, problemId);
  }
}
