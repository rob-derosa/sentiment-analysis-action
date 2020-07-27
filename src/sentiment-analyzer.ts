import fetch from 'node-fetch'

export interface ResponseDocumentRoot {
  documents: ResponseDocument[];
  errors: any[];
  modelVersion: Date;
}

export interface ResponseDocument {
  id: string;
  sentiment: string;
  documentScores: Scores;
  sentences: Sentence[];
}

export interface Scores {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Sentence {
  sentiment: string;
  sentenceScores: Scores;
  offset: number;
  length: number;
}

export interface RequestDocumentRoot {
  documents: RequestDocument[];
}

export interface RequestDocument {
  language: string;
  id: string;
  text: string;
}



export async function callSentimentAnalysisEndpoint(textToCheck: string, textLanguage: string, azureCognitiveEndpoint: string, azureCognitiveSubscriptionKey: string): Promise<ResponseDocumentRoot> {
  try {

    let url = `${azureCognitiveEndpoint}/text/analytics/v3.0-preview.1/sentiment`

    let requestRoot = {
      documents: Array<RequestDocument>()
    }

    requestRoot.documents.push({
      id: "1",
      language: textLanguage,
      text: textToCheck
    });

    return fetch(url, {
      method: "POST",
      body: JSON.stringify(requestRoot),
      headers: {
        "Ocp-Apim-Subscription-Key": azureCognitiveSubscriptionKey,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(res => {
        return res as ResponseDocumentRoot
      });
  } catch (error) {
    console.log(error);
    throw error
  }
}