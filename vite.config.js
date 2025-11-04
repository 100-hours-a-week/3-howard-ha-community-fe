import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                login: resolve(__dirname, 'index.html'),
                posts: resolve(__dirname + '/pages', 'posts.html'),
                signup: resolve(__dirname + '/pages', 'signup.html'),
                editPassword: resolve(__dirname + '/pages', 'edit-password.html'),
                editPost: resolve(__dirname + '/pages', 'edit-post.html'),
                editUserInfo: resolve(__dirname + '/pages', 'edit-user-info.html'),
                postDetail: resolve(__dirname + '/pages', 'post-detail.html'),
                writePost: resolve(__dirname + '/pages', 'write-post.html'),
                header: resolve(__dirname + '/pages/components', 'header.html'),
            },
        },
    },
});