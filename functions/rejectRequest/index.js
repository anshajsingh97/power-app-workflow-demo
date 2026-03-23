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

    // ✅ Validation
    if (!requestId || !caseId) {
        context.res = {
            status: 400,
            body: "Missing requestId or caseId"
        };
        return;
    }

    try {
        // ✅ Optional: prevent multiple updates
        const entity = await client.getEntity(caseId, requestId);

        if (entity.status !== "Pending") {
            context.res = {
                headers: { "Content-Type": "text/html" },
                body: `
                <html>
                <body style="font-family: Arial; text-align:center; margin-top:50px;">
                    <h3>This request is already ${entity.status}</h3>
                </body>
                </html>`
            };
            return;
        }

        // ✅ Update status
        await client.updateEntity({
            partitionKey: caseId,
            rowKey: requestId,
            status: "Rejected"
        }, "Merge");

    } catch (error) {
        context.log("Error:", error);

        context.res = {
            status: 500,
            body: "Error updating request"
        };
        return;
    }

    // ✅ HTML Response
    context.res = {
        headers: {
            "Content-Type": "text/html"
        },
        body: `
        <html>
        <body style="font-family: Arial; text-align:center; margin-top:50px;">
            <h2 style="color:red;">❌ Request Rejected</h2>
            <p>Your action has been recorded.</p>
        </body>
        </html>
        `
    };
};
