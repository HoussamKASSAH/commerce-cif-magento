1. Login to Splunk Cloud and execute the query:
```
index="runtime_prod_ext" namespace="CUSTOMER_NAMESPACE"
```
2. Use the sidebar to further filter your results. Please be aware that only activations that produce logs are available in Splunk.
3. To retrieve the logs of a specific action invocation, you can use the query:
```
index="runtime_prod_ext" activation_id="ACTIVATION-ID"
```