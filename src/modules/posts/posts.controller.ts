import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ActiveUser } from '../auth/decorator/active-user.decorator.js';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface.js';
import { Auth } from '../auth/decorator/auth.decorator.js';
import { AuthType } from '../auth/enums/auth-type.enum.js';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { GetPostsDto } from './dto/get-posts.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { UPLOAD_LIMITS } from '../uploads/constants/upload.constants.js';
import { FileValidationPipe } from '../uploads/pipes/file-validation.pipe.js';
import { FileSignaturePipe } from '../uploads/pipes/file-signature.pipe.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Creates a new blog post.' })
  @ApiResponse({
    status: 201,
    description: 'The post has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed.',
  })
  public create(
    @Body() createPostDto: CreatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create(createPostDto, user);
  }

  @Get()
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Returns all posts with pagination and filters.' })
  @ApiResponse({
    status: 200,
    description: 'Posts were successfully retrieved.',
  })
  public getAllPosts(@Query() postQuery: GetPostsDto, @Req() request: Request) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;

    return this.postsService.findAll(postQuery, currentUrl);
  }

  @Get('published')
  @Auth(AuthType.None)
  @ApiOperation({
    summary: 'Returns all published posts with pagination for public feed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Published posts were successfully retrieved.',
  })
  public getPublishedPosts(
    @Query() postQuery: GetPostsDto,
    @Req() request: Request,
  ) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;

    return this.postsService.findPublishedPosts(postQuery, currentUrl);
  }

  @Get('me')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({
    summary:
      'Returns all posts belonging to the authenticated user with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'My posts retrieved successfully.',
  })
  public getMyPosts(
    @Query() postQuery: GetPostsDto,
    @Req() request: Request,
    @ActiveUser() user: ActiveUserData,
  ) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;
    return this.postsService.findMyPosts(postQuery, currentUrl, user);
  }

  @Get('drafts/me')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({
    summary:
      'Returns the current authenticated user draft posts with pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'My draft posts retrieved successfully.',
  })
  public getMyDraftPosts(
    @Query() postQuery: GetPostsDto,
    @Req() request: Request,
    @ActiveUser() user: ActiveUserData,
  ) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;
    return this.postsService.findMyDraftPosts(postQuery, currentUrl, user);
  }

  @Get('drafts')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({
    summary:
      'Returns all draft posts with pagination for administrative review.',
  })
  @ApiResponse({
    status: 200,
    description: 'Draft posts retrieved successfully.',
  })
  public getDraftPosts(
    @Query() postQuery: GetPostsDto,
    @Req() request: Request,
  ) {
    const currentUrl = `${request.protocol}://${request.headers.host}${request.path}`;
    return this.postsService.findDraftPosts(postQuery, currentUrl);
  }

  @Post(':id/cover')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Upload or update the cover image of a post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UPLOAD_LIMITS.MAX_FILE_SIZE_BYTES },
    }),
  )
  public async uploadCover(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(FileValidationPipe, FileSignaturePipe)
    file: Express.Multer.File,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.uploadPostCover(id, file, user);
  }

  @Delete(':id/cover')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Delete the cover image of a post' })
  public async deleteCover(
    @Param('id', ParseIntPipe) postId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.deletePostCover(postId, user);
  }

  @Patch(':id/restore')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Restores a soft-deleted blog post.' })
  @ApiResponse({
    status: 200,
    description: 'Post was successfully restored.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. The post is not deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You are not the author of this post.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public restorePost(
    @Param('id', ParseIntPipe) postId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.restoreDeletedPost(postId, user);
  }

  @Patch(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Updates an existing blog post in the database.' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  public updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update(postId, updatePostDto, user);
  }

  @Delete(':id')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @ApiOperation({ summary: 'Deletes an existing blog post.' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  public deletePost(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.delete(id, user);
  }

  @Get(':id')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Gets a single blog post by its numeric ID.' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public getPostById(@Param('id', ParseIntPipe) postId: number) {
    return this.postsService.findById(postId);
  }

  @Get('slug/:slug')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Retrieves a single blog post by its slug.' })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public getPostBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Patch(':id/publish')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Publishes a draft blog post.' })
  @ApiResponse({
    status: 200,
    description: 'Post published successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You are not the author of this post.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public publishPost(
    @Param('id', ParseIntPipe) postId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.publish(postId, user);
  }

  @Patch(':id/unpublish')
  @Auth(AuthType.Bearer, AuthType.Cookie)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Unpublishes a published blog post back to draft.' })
  @ApiResponse({
    status: 200,
    description: 'Post unpublished successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. You are not the author of this post.',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found.',
  })
  public unpublishPost(
    @Param('id', ParseIntPipe) postId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.unpublish(postId, user);
  }
}
