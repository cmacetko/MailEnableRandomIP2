const regedit = require("regedit");
const { exec } = require("child_process");
const util = require("util");

const execAsync             = util.promisify(exec);
const regPath               = "HKLM\\SOFTWARE\\Wow6432Node\\Mail Enable\\Mail Enable\\Connectors\\SMTP\\";

const servers               = [
    { ip: "1.0.0.1", hostname: "mail1.teste.com.br" },
    { ip: "1.0.0.2", hostname: "mail2.teste.com.br" },
    { ip: "1.0.0.3", hostname: "mail3.teste.com.br" },
    { ip: "1.0.0.4", hostname: "mail4.teste.com.br" }
];

const randomServer          = servers[Math.floor(Math.random() * servers.length)];
const randomIP              = randomServer.ip;
const randomHostname        = randomServer.hostname;

async function modifyRegistry() {

    const valuesToPut = {
        [`${regPath}`]: {
            "Outbound Interface": {
                value: randomIP,
                type: "REG_SZ"
            },
            "Host Name": {
                value: randomHostname,
                type: "REG_SZ"
            }
        }
    };

    return new Promise((resolve, reject) => {

        regedit.putValue(valuesToPut, (err) => {

            if (err) 
            {

                return reject("Erro ao modificar o registro: " + err);

            }

            console.log("IP de saida alterado");
            console.log("Hostname de saida alterado");

            resolve();

        });

    });

}

async function restartService() {

    try {

        await execAsync("net stop MESMTPCS && net start MESMTPCS");

        console.log("Servico MESMTPCS reiniciado com sucesso");

    } catch (error) {

        console.error("Erro ao reiniciar o servico SMTP: " + error.message);

    }

}

async function main() {

    console.log(">> Comando Iniciado <<");
    console.log("randomIP: " + randomIP);
    console.log("randomHostname: " + randomHostname);

    try {

        await modifyRegistry();
        await restartService();

        console.log("Entrada Atualizada com Sucesso");
        
    } catch (error) {
        
        console.error("Falha em Atualizar Entrada", error);
        
    } finally {

        process.exit();
        
    }

}

main();