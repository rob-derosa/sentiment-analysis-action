import * as pii from "./sentiment-analyzer";
import * as core from "@actions/core";
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const subKey = core.getInput("azureCognitiveSubscriptionKey", { required: true })
    const url = core.getInput("azureCognitiveEndpoint", { required: true })
    const textToAnalyze = core.getInput("textToAnalyze", { required: true })
    const textLanguage = core.getInput("textLanguage", { required: true })

    console.log(github.context.payload);

    if (!subKey)
      throw new Error('No Azure Cognitive Service subscription key defined');

    if (!url)
      throw new Error('No Azure Cognitive Service endpoint defined');

    if (!textToAnalyze)
      throw new Error('No text passed in to analyze');

    const response = await pii.callSentimentAnalysisEndpoint(textToAnalyze, textLanguage, url, subKey)

    if (response) {
      console.log("\n\n------------------------------------------------------");
      console.log(JSON.stringify(response));
      console.log("------------------------------------------------------\n\n");

      core.setOutput("results", JSON.stringify(response));
      console.log("------------------------------------------------------\n\n");
    }
    else{
      console.log("There was no response from the Sentiment Analysis endpoint");
    }

    core.setOutput("results", JSON.stringify(response));
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()