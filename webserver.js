const {submitToAnthropic} = require("./anthropicHttp.js");
const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");
const app = express();
const devPort = 4000;
app.use( express.static(path.join(__dirname,"server")) );
// app.use( express.json({limit: "200mb"}));

//--- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir()); // Folder where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original filename
    }
});
const upload = multer( {storage} );
//--- Multer Configuration ---

// nice JSON formatting
// eslint-disable-next-line no-unused-vars
const jss = (...o)=>JSON.stringify(o[0], null, o[1] ? 2:0);

// Set port apropos for Heroku
const onHeroku = process.argv.find( param=>param==="heroku")

const defaultPrompt =
`please return a true json object only, exclude putting the "json" at the beginning of
your response, and send no other narrative. The response should contain all the extracted fields
and values, and include these top-level properties:
- "organization",  that has the name of the organization. If not clearly evident, it usually can be inferred from "pay to the order" field
- "finalAmount", a number that is the final amount due for this invoice`;


app.get("/api",(req,res)=>{
    res.status(200).json({msg:"api endpoint"});
});

// Consolidate handler for making requests to Claude/Anthropic
const handleAnthropicRequest = async (req,res)=>{
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const {imageQuestion} = req.body;
    const analysisRequest = imageQuestion || defaultPrompt;

    console.log(`HandleAnthropicRequest()\nQuestion: ${analysisRequest}\nFile: ${req.file.path}`);

    const documentInfo = {
        imagePath: req.file ? req.file.path : null,
        mimeType: req.file ? req.file.mimetype : null
    }
    const {data,error} = await submitToAnthropic(analysisRequest,apiKey,documentInfo)

    // Handle the error case and leave
    if(error){
        console.log(`Error occurred: ${error}`)
        res.status(400).json( {error} )
        return
    }

    // we got valid response, extract the message
    const billDataStr = data.content[0].text
console.log(`billDataStr: ${billDataStr}`)
    // preprocess for either data, or narrative
    console.log(`Claude returned data...`)
    const billTerms = extractJsonOrText(billDataStr);
    let resp = {
        status: "forms processed",
        originalName: req.file.originalname,
    };
    if(billTerms.narrative) resp = {...resp, narrative:billTerms.narrative}
    else resp = {...resp,billTerms}
    res.status(200).json(resp);
}

app.post("/api/analyze", upload.single("invoice"), async (req,res)=>{
    const {imageQuestion} = req.body;
    const {path,mimetype} = req.file;
    console.log(`/API/ANALYZE question: ${imageQuestion},\nimage?: ${path}\ntype: ${mimetype}`)
    await handleAnthropicRequest(req,res);
});


const extractJsonOrText = (msg)=>{
    let result = "";
    try{
        result = JSON.parse(msg);
    } catch(e) {
        console.log(`extractJsonOrText: ${e}`)
        result = {
            narrative: msg
        }
    }
    return result;
}

app.post("/submit", upload.single("invoice"), async (req,res)=>{
    console.log(`/SUBMIT`);
    await handleAnthropicRequest(req,res);
});

// Default to running in Dev Mode
let  ourPort = devPort;
if(onHeroku) {
	console.log("*** HEROKU SELECTED ***");
	ourPort = process.env.PORT;
}

app.listen( ourPort,()=>{
    console.log(`Listening on ${ourPort} ${onHeroku ? "[HEROKU SELECTED]":"<dev>"}`);
})


