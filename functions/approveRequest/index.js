const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

module.exports = async function (context, req) {

    const account = process.env.STORAGE_ACCOUNT_NAME;
    const key = process.env.STORAGE_ACCOUNT_KEY;

    const client = new TableClient(
        `https://${account}.table.core.windows.net`,
        "requests",
        new AzureNamedKeyCredential(account, key)
    );

    const requestId = req.query.requestId;
    const caseId = req.query.caseId;

    if (!requestId || !caseId) {
        context.res = { status: 400, body: "Missing parameters" };
        return;
    }

    try {
        await client.updateEntity({
            partitionKey: caseId,
            rowKey: requestId,
            status: "Approved"
        }, "Merge");
    } catch (err) {
        context.log(err);
        context.res = { status: 500, body: "Error updating request" };
        return;
    }

    context.res = {
        headers: { "Content-Type": "text/html" },
        body: `
        <html>
        <body style="font-family: Arial; text-align:center; margin-top:50px;">
            <h2 style="color:green;">✅ Request Approved</h2>
        </body>
        </html>`
    };
};
