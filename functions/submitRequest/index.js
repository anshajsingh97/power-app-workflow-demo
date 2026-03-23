const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");


module.exports = async function (context, req) {

    const account = process.env.STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.STORAGE_ACCOUNT_KEY;

    const credential = new AzureNamedKeyCredential(account, accountKey);

    const client = new TableClient(
        `https://${account}.table.core.windows.net`,
        "requests",
        credential
    );

    const requestId = Date.now().toString();

    const entity = {
        partitionKey: req.body.caseId,
        rowKey: requestId,
        segment: req.body.segment,
        category: req.body.category,
        amount: req.body.amount,
        email: req.body.email,
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    await client.createEntity(entity);

    // CALL LOGIC APP HERE
    await fetch("https://prod-00.southindia.logic.azure.com:443/workflows/94371078d235413a8a8818ec3b0e214f/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=asmLiwED6tOfN86yE55sOOhMWw2moC_C7kethaI8BMk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requestId: requestId,
            caseId: req.body.caseId,
            segment: req.body.segment,
            category: req.body.category,
            amount: req.body.amount,
            email: req.body.email
        })
    });

    context.res = {
        status: 200,
        body: {
            message: "Saved successfully",
            requestId: requestId
        }
    };
};
