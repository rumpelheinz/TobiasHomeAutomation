import nconf from 'nconf';
import fs from 'fs';
nconf.use('file', { file: './config.json' });
nconf.load();
nconf.defaults({
    "socket": true,
    "mysql": {
        "host": "localhost",
        "user": "<sql-username-here>",
        "password": "<sql-password-here>",
        "database": "<sql-database-here>"
    },
    "password": "<password-for-roomcontrol-here>",
    "StepRoute": "/routeforsendingstepcounts"
})

function saveConf() {
    nconf.save(function (err: { message: any; }) {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('Configuration saved successfully.');
    });
}
try {
    if (fs.existsSync('./config.json')) {
    }
    else {
        nconf.set("mysql",{
            "host": "localhost",
            "user": "<sql-username-here>",
            "password": "<sql-password-here>",
            "database": "<sql-database-here>"
        })

        saveConf();
    }
} catch (err) {
    console.error(err)
}


export { nconf as myNconf, saveConf };