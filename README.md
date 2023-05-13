# Deploy to Pterodactyl 

Build from GitHub push and deploy to Pterodactyl server


## Usage

```yaml
name: Node Js

on: [ push ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm ci
      - run: npm run build --if-present

```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
