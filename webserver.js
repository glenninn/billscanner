const {submitImageToAnthropic} = require("./anthropicHttp.js");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const app = express();
const claudeModel = require("./claudeModel.js");
const devPort = 4000;
app.use( express.static(path.join(__dirname,"server")) );

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
const jss = (...o)=>JSON.stringify(o[0], null, o[1] ? 2:0);

// Set port apropos for Heroku
const onHeroku = process.argv.find( param=>param==="heroku")


app.get("/api",(req,res)=>{
    res.status(200).json({msg:"api endpoint"});
});

app.post("/submit", upload.single("invoice"), async (req,res)=>{
    console.log(`/SUBMIT`);
    if(!req.file){
        return res.status(400).json({ error: "no file uploaded"});
    }
    let resp = {};

    try {
        // Send image to anthropic
        console.log(`Sending to Anthropic`)
        billTermsJson  = await analyze(req.file.path);
        console.log(`Parsing return values...`)
        billTerms = JSON.parse(billTermsJson);
        resp = {
            status: "forms processed",
            originalName: req.file.originalname,
            file: req.file,
            billTerms
        };
        console.log(`Full data return: ${jss(resp,1)}`)
    } catch(e) {
        console.log(`Exception in Anthropic: ${e}`);
        return res.status(400).json({Exception: e});
    }
    res.status(200).json( resp );
});

const showTextResults = (results)=> {
    const responseString = results.content.reduce( (msg,content)=>{
        return content.type==="text" ? content.text : "";
    },"");
    return responseString;
}

const analyze = async(billImage)=>{
    const apiKey = process.env.ANTHROPIC_API_KEY;

    const optionalQuestion =
    `please return a json object only, with no other narrative, that has all the extracted fields
    and values, and include these top-level properties:
    - "organization",  that has the name of the organization. If not clearly evident, it usually can be inferred from "pay to the order" field
    - "finalAmount", a number that is the final amount due for this invoice`;
    console.log(`Submitting Invoice: ${billImage}`)
    console.log(`using Claude model: ${claudeModel}`)
    const response = await submitImageToAnthropic(billImage,apiKey,optionalQuestion)
    const billDataStr = response.content[0].text
    console.log(`The Bill data is: ${showTextResults(response)}`);
    return billDataStr;
}

// Default to running in Dev Mode
let  ourPort = devPort;
if(onHeroku) {
	console.log("*** HEROKU SELECTED ***");
	ourPort = process.env.PORT;
}

app.listen( ourPort,()=>{
    console.log(`Listening on ${ourPort} ${onHeroku ? "[HEROKU SELECTED]":"<dev>"}`);
})


