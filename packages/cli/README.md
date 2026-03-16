# zero-cli

CLI for [Pyreon Zero](https://github.com/user/pyreon-zero) — dev server, production builds, and preview.

## Install

```bash
bun add -D zero-cli
```

## Commands

```bash
zero dev [root]      # Start development server
zero build [root]    # Build for production
zero preview [root]  # Preview production build
```

### Options

```bash
# dev / preview
--port <port>    # Server port (default: 3000)
--host [host]    # Server host
--open           # Open browser on start

# build
--mode <mode>    # Rendering mode override (ssr, ssg, spa)
```

## License

[MIT](LICENSE)
