If your I/O Runtime namespace is provisioned via the Adobe I/O console, please follow these steps:

1. Install the [Adobe I/O CLI](https://github.com/adobe/aio-cli). 
    ```bash
    npm install -g @adobe/aio-cli
    ```

2. Install the [Adobe I/O Runtime Plugin](https://github.com/adobe/aio-cli-plugin-runtime).
    ```bash
    aio plugins install @adobe/aio-cli-plugin-runtime
    ```

3. To update the plugin, please run
    ```bash
    aio plugins install @adobe/aio-cli-plugin-runtime@latest
    ```
4. To setup the credentials for your namespace, follow https://git.corp.adobe.com/rstewart/runtime-documentation/blob/master/reference/cli_use.md or create the `.wskprops` file manually.

---

Alternatively, you can also use the OpenWhisk CLI:
1. Install the OpenWhisk [wsk](https://github.com/apache/incubator-openwhisk-cli/releases) CLI.
2. Login to your namespace using this command:
    ```bash
    wsk property set --apihost adobeioruntime.net --auth AUTH_KEY --namespace CUSTOMER_NAMESPACE
    ```
3. This command stores the credentials in a `~/.wskprops` file which `wsk` will use for subsequent commands.