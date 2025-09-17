import { DestinationStatusEvaluationParams, Env } from '@/bindings';
import { collectDestinationInfo } from '@/helpers/browser-render';
import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from 'cloudflare:workers';

const exampleParams: DestinationStatusEvaluationParams = {
    "linkId": "EqZQf0WQ8Q",
    "destinationUrl": "https://akbarsahata.id",
    "accountId": "1234567890",
}

export class DestinationEvaluationWorkflow extends WorkflowEntrypoint<Env, DestinationStatusEvaluationParams> {
    async run(event: Readonly<WorkflowEvent<DestinationStatusEvaluationParams>>, step: WorkflowStep) {

        const collectedData = await step.do("Collect rendered destination page data", async () => {
            return collectDestinationInfo(this.env, event.payload.destinationUrl);
        });

        console.log(collectedData);
    }
}