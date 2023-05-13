const core = require('@actions/core');
const fs = require('fs');
const shared = require('./shared');

// most @actions toolkit packages have async methods
async function run() {
    try {
        const sourcePath = core.getInput('source', {required: true, trimWhitespace: true});
        const targetPath = core.getInput('target', {required: true, trimWhitespace: true});
        const panelUrl = core.getInput('panel-url', {required: true, trimWhitespace: true});
        const serverId = core.getInput('server-id', {required: true, trimWhitespace: true});
        const apiToken = core.getInput('api-key', {required: true, trimWhitespace: true});
        const doRestart = core.getInput('restart', {required: false, trimWhitespace: true}) === 'true';
        const doForceKill = core.getInput('force-restart', {required: false, trimWhitespace: true}) === 'true';

        //check if exists
        if (!fs.existsSync(sourcePath)) {
            throw new Error(`Source path ${sourcePath} does not exist`);
        }
        const isDirectory = fs.lstatSync(sourcePath).isDirectory();


        const axios = shared.axios;
        shared.setAxios(panelUrl, apiToken);

        core.info(`Uploading ${isDirectory ? "directory" : "file"} ${sourcePath} to ${targetPath}`);
        let sourceFile = sourcePath
        let targetFile = targetPath
        if(isDirectory){
            //zip
            const zipPath = `${sourcePath}.zip`;
            await shared.zip(sourcePath, zipPath);
            //check if exists
            if (!fs.existsSync(zipPath)) {
                throw new Error(`Zip file ${zipPath} does not exist`);
            }
            sourceFile = zipPath;
            targetFile = `${targetPath}.zip`;
        }

        const buffer = fs.readFileSync(sourceFile);
        const uploadFileResponse = await axios.post(`/api/client/servers/${serverId}/files/write`, buffer, {
            params: {
                file: targetFile,
            }
        });
        console.log(uploadFileResponse.data);

        if(isDirectory){
            //unzip
            const res = await shared.decompress(serverId, targetPath, targetFile);
            console.log(res);
        }
        if (doRestart) {
            if (doForceKill) {
                const lastPowerState = await shared.getResource(serverId).attributes.current_state;
                if (lastPowerState === "running") {
                    core.info("Server is running, killing it");
                    await shared.setPowerState(serverId, "kill");
                    await shared.waitUntilPowerState(serverId, "offline");
                }
                if (lastPowerState === "starting") {
                    core.info("Server is starting, waiting for it to finish");
                    await shared.waitUntilPowerState(serverId, "running");
                    core.info("Server is running, killing it");
                    await shared.setPowerState(serverId, "kill");
                    await shared.waitUntilPowerState(serverId, "offline");
                }
                const currentPowerState = await shared.getResource(serverId).attributes.current_state;
                if (currentPowerState !== "offline") {
                    throw new Error(`Server is not offline, it is ${currentPowerState}`);
                } else {
                    //start
                    core.info("Server is offline, starting it");
                    await shared.setPowerState(serverId, "start");
                }
            } else {
                core.info("Restarting server");
                const restartResponse = await axios.post(`/api/client/servers/${serverId}/power`, {
                    signal: "restart",
                });
                console.log(restartResponse.data);
            }
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
