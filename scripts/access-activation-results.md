1. To retrieve a table of activation ids (first column) and action names (second column), run
    ```bash
    # AIO CLI
    aio runtime:activation:list

    # OW CLI
    wsk activation list
    ```
    Optionally, using the `--help` parameter, you see an overview of additional parameters to further filter and expand the list.

2. To see the meta data of a specific action invocation from the given list, use
    ```bash
    # AIO CLI
    aio runtime:activation:get ACTIVATION-ID

    # OW CLI
    wsk activation get ACTIVATION-ID
    ```
    This command will return a formatted JSON response that contains data like duration, response and others.