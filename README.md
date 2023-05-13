# Deploy to Pterodactyl 

Build from GitHub, push and deploy to Pterodactyl server


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
      - name: Deploy To Pterodactyl
        # You may pin to the exact commit or the version.
        # uses: Itzbenz/deploy-to-pterodactyl@aedc174331b47957ea579457707a22ee3b2daa79
        uses: Itzbenz/deploy-to-pterodactyl@v0.1
        with:
          # The source file/folder to deploy
          source: dist/
          # The destination folder to deploy to
          target: .
          # The API endpoint of the Pterodactyl server e.g. "https://pterodactyl.file.properties/
          panel-url: https://pterodactyl.file.properties/
          # The ID of the Pterodactyl server
          server-id: ${{ secrets.API_KEY }}
          # The API key of the Pterodactyl server
          api-key: ${{ secrets.SERVER_ID }}
          # Whether to restart the server after deploying the plugin
          restart: true
          # Force kill the server if it is running for faster restart
          force-restart: true

```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
