# Project conventions

- Vue Single-File Components always begin with the `<template>` block; the `<script>` block follows afterwards.
- New Vue components use the Composition API with `<script setup lang="ts">`.
- Application code and Pinia stores use TypeScript (`.ts`); do not bypass types with `any`. Always check types with `pnpm typecheck`.
- Pages belong in `src/pages`, reusable UI elements in `src/components`, and stores in `src/stores`.
- Shared domain types belong in `src/types`.