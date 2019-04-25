1. Install the OpenWhisk [wsk](https://github.com/apache/incubator-openwhisk-cli/releases) CLI.
1. Login to your namespace using this command: `wsk property set --apihost adobeioruntime.net --auth AUTH_KEY --namespace CUSTOMER_NAMESPACE`
1. This command stores the credentials in a `~/.wskprops` file which `wsk` will use for subsequent commands.