# Original source history

This repository contains the Zashita web application version 0.1.2, imported from the existing deployment source without changing the running site.

The original Git history is included in `Zashita-web-v0.1.2.bundle` because this import was performed through GitHub's web uploader. The bundle contains the three original release commits and the new English/Russian documentation commit, ending at:

`88f083420042a2dc94827e2b054a85f76485aa32`

To restore the original history into a separate directory:

```sh
git clone Zashita-web-v0.1.2.bundle Zashita-original-history
```

The application and translated documentation files in this repository match that snapshot. GitHub's web-upload commits record the import in this repository; the bundle preserves all four source commits separately. The deployed application remains version 0.1.2; these documentation changes do not translate its interface or change the live deployment.

No local papers, user API keys, browser records, node_modules or generated distribution bundles are included. Literal key-shaped strings in browser test fixtures are test inputs, not production credentials.

The `.openai/hosting.json` file identifies the existing Sites deployment; preserve it when maintaining that same deployment. It is deployment metadata, not an API secret.
