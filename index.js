const {submitImageToAnthropic,sendChatMessage} = require("./anthropicHttp.js");
const claudeModel = require("./claudeModel.js");
const readline = require("readline")

const apiKey = process.env.ANTHROPIC_API_KEY;
const theImage = ".\\bill-2025-02-02.jpg";

const jss = (...o)=>JSON.stringify(o[0],null,o[1] ? 2 : 0)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Basic prompt example
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// Handle the close event
rl.on('close', () => {
    console.log('\nThank you for your responses!');
    process.exit(0);
});

const showTextResults = (results)=> {
    const responseString = results.content.reduce( (msg,content)=>{
        return content.type==="text" ? content.text : "";
    },"");
    return responseString;
}

async function main() {

    let done = false;
    while(!done) {
        try{
            let commandString = await askQuestion("cmd $ ");
            const params = commandString.match(/(\.?\/?[\w.-]+)/g);
            const userCommand = params[0];

            if((userCommand === "q") || (userCommand === "quit")){
                done = true;
            } else if(userCommand === "image") {
                if(params.length < 2) {
                    console.log(`Please provide a bill file to process`);
                    break;
                }
                let billImage = params[1];
                let optionalQuestion = await askQuestion(`What info from image do you need to know\nquestion> `);
                if(optionalQuestion === "") optionalQuestion = undefined;
                console.log(`Submitting image: ${billImage}`)
                console.log(`using Claude model: ${claudeModel}`)
                const response = await submitImageToAnthropic(billImage,apiKey,optionalQuestion)
                console.log(showTextResults(response) );
            } else if(userCommand === "bill") {
                if(params.length < 2) {
                    console.log(`Please provide a bill file to process`);
                    break;
                }
                billImage = params[1];
                console.log(`Bill image: ${billImage}`)
                optionalQuestion = `please return a json object with all the extracted fields
                 and values, and include a property, "organization" that has the name of the organization, or "unknown"`;
                 console.log(`Submitting Invoice: ${billImage}`)
                 console.log(`using Claude model: ${claudeModel}`)
                 const response = await submitImageToAnthropic(billImage,apiKey,optionalQuestion)
                 const billDataStr = response.content[0].text
                 console.log(`The Bill data is: ${showTextResults(response)}`);
             } else {
                // const reply = await sendChatMessage(userCommand, apiKey);
                const reply = await submitImageToAnthropic(null,apiKey,userCommand);
                console.log( showTextResults(reply));
            }
        }catch(e) {
            console.log(`Exception: ${e}`);
            done = true;
        }

    }
    rl.close();
}

main();

