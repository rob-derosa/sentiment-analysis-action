# Sentiment Analysis Action 

This is a sample GitHub action to analyze sentiment in any issues or pull requests that are opened, edited or commented on. If negative sentiment is detected using the [Sentiment Analysis Cognitive Service](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/how-tos/text-analytics-how-to-sentiment-analysis?tabs=version-3) from Microsoft with a confidence score of >= 90%, a custom label `negativity detected` is added to the issue or pull request.

A `results` output value is available containing the JSON response payload providing a detailed analysis of the results.

For this sample, I tried to keep the typescript logic limited to just analyzing sentiment on input text. The rest of the logic is in the `analyze-sentiment.yml` workflow file. This allows for greater variation on how and when to react to sentiment.

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
      
      - name: set text input pull request
        if: ${{ github.event.pull_request.body }}
        run: |
          echo "::set-env name=TEXT_TO_ANALYZE::${{ github.event.pull_request.body }}"

      - name: set text input issue
        if: ${{ github.event.issue.body }}
        run: |
          echo "::set-env name=TEXT_TO_ANALYZE::${{ github.event.issue.body }}"

      - name: set text input comment
        if: ${{ github.event.comment.body }}
        run: |
          echo "::set-env name=TEXT_TO_ANALYZE::${{ github.event.comment.body }}"
      
      - uses: ./
        id: analyzeSentiment
        name: "Run Sentiment Analysis"
        with:
          azure-cognitive-subscription-key: ${{ secrets.AZURE_COGNITIVE_SUBSCRIPTION_KEY }}
          azure-cognitive-endpoint: ${{ secrets.AZURE_COGNITIVE_ENDPOINT }}
          text-to-analyze: ${{ env.TEXT_TO_ANALYZE }}
          text-language: "en"
      - name: Dump output
        env:
          OUTPUTS: ${{ toJson(steps.analyzeSentiment.outputs) }}
        run: echo "$OUTPUTS"
      - name: label issue
        if: ${{ steps.analyzeSentiment.outputs.negative >= .9 }}
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

**A PR filed by a user that contained negative sentiment**
![Sentiment Analysis Step Output](https://github.com/rob-derosa/SentimentAnalysisAction/blob/main/assets/sentiment_analysis_action_output.png?raw=true)

**The confidence score for this PR was over 60% so the PR was labeled accordingly**
![PR containing negative sentiment flagged with label](https://github.com/rob-derosa/SentimentAnalysisAction/blob/main/assets/sentiment_analysis_pr_labeled.png?raw=true)


## Limitations

* There is a 5,120 character limit and 1MB total request payload size as outlined [here](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/concepts/data-limits?tabs=version-3).
* This sample could be extended to batch the request up to 5 per payload.

## License

MIT