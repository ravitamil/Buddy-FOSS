---
trigger: always_on
alwaysApply: true
---

Avoid executing terminal commands in the active development server terminal, as this will terminate the running dev server.

Do mind that it's a greenfield project which is in active development and not yet in production. SO no more legacy or deprecated codes any changes can be directly applied

Do not open application previews, as the app is continuously running via EAS dev builds on a physical device.

Codebase requirements:

- Implement modular and scalable architecture
- Eliminate code redundancy
- Maintain clear, understandable code structure
- Organize files with descriptive names in logical folder structures

Project specifications:

- React Native with Expo (managed workflow)
- Mandatory use of Expo packages and modules
- Navigation must use expo-router
- Utilize Context API (version 7) for state management
- Incorporate appropriate MCP tools when needed
- Expo Go is prohibited - development builds are required
- Components must support both dark and light themes
- Follow Tamagui and Expo best practices

System requirements:

- Windows environment
- Use proper PowerShell syntax for all commands

Exclusions:

- Unit testing
- Storybook integration

Development protocols:

- Always use `npx expo install` for dependency installation
- Perform `npx type check` before concluding any changes
- Resolve all TypeScript errors prior to closing the conversation
