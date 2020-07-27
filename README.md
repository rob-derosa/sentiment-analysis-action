# Sentiment Analysis Action 

This is a GitHub action to analyze sentiment in any issues or pull requests that are opened, edited or commented on. If negative sentiment is detected using the [Sentiment Analysis Cognitive Service](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/how-tos/text-analytics-how-to-sentiment-analysis?tabs=version-3) from Microsoft with a confidence score of >= 60%, a custom label `negativity detected` is added to the issue or pull request.

A `results` output value is available containing the JSON response payload providing a detailed analysis of the results.

## Usage

Create a `.github/workflows/analyze-sentiment.yml` file:

```yaml
name: 'analyze-sentiment'
on:
  issues:
    types:
      - opened
      - edited
  issue_comment:
    types:
      - created
      - edited
  pull_request:
    types:
      - opened
      - edited
  pull_request_review_comment:
    types:
      - created
      - edited

jobs:
  analyze-sentiment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: set text input to issue
        if: ${{ github.event.issue.body }}
        run: |
          echo ::set-env name=TEXT_TO_ANALYZE::${{ github.event.issue.body }}

      - name: set text input to comment
        if: ${{ github.event.comment.body }}
        run: |
          echo ::set-env name=TEXT_TO_ANALYZE::${{ github.event.comment.body }}
      
      - uses: ./
        id: analyzeSentiment
        name: "run sentiment analysis"
        with:
          azureCognitiveSubscriptionKey: ${{ secrets.AZURE_COGNITIVE_SUBSCRIPTION_KEY }}
          azureCognitiveEndpoint: ${{ secrets.AZURE_COGNITIVE_ENDPOINT }}
          textToAnalyze: ${{ env.TEXT_TO_ANALYZE }}
          textLanguage: "en"
      - name: label issue
        if: ${{ steps.analyzeSentiment.outputs.negative >= .6 }}
        uses: andymckay/labeler@master
        with:
          add-labels: "negativity detected"
```

## Configuration

The following inputs are required:

- `azure-cognitive-subscription-key`: A valid [Azure Cognitive Service](https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesAllInOne) key
- `azure-cognitive-endpoint`: in the [Azure portal](https://portal.azure.com), navigate to your Cognitive Service resource > Keys and Endpoint > Endpoint (i.e. `https://centralus.api.cognitive.microsoft.com/`)
- `text-to-analyze`: the text to analyze for sentiment
- `text-language`: the language of the text to be analyzed (i.e. `en`)

## In Action

<!-- **A bug filed by a user was commented on by a contributor, triggering an PII analysis of the body of the comment**
![PII Detection Step Output](https://github.com/rob-derosa/PiiDetectionAction/blob/main/assets/pii_detection_action_output.png?raw=true)

**PII was detected, some of which was discarded due category configuration**
![Issue containing PII flagged with label](https://github.com/rob-derosa/PiiDetectionAction/blob/main/assets/pii_detection_issue_labeled.png?raw=true) -->


## Limitations

* There is a 5,120 character limit and 1MB total request payload size as outlined [here](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/concepts/data-limits?tabs=version-3).
* This sample could be extended to batch the request up to 5 per payload.

## License

MIT