import { Command } from 'commander';
import { getExistingContacts, postContactValidationResults } from './problems/contacts.js';
import { validateDataset } from './validators.js';
import { runWhiteboard } from './problems/whiteboarding.js';
const cli = new Command();

cli
  .command('execute-contact-validations')
  .description('Execute contact validations against the dataset')
  .option('-t, --test', 'set test mode')
  .action(async (options: { test?: boolean }) => {
    const dataset = await getExistingContacts(options.test);
    const { validAssociations, invalidAssociations } = validateDataset(dataset);

    await postContactValidationResults({ validAssociations, invalidAssociations }, options.test);

    console.log({
      validAssociations,
      invalidAssociations,
      existingAssociations: dataset.existingAssociations,
      newAssociations: dataset.newAssociations,
    });
  });

cli
  .command(`whiteboard`)
  .description(`Run the whiteboarded function for the coding interview`)
  .action(() => runWhiteboard());

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  cli.outputHelp();
} else {
  cli.parse(process.argv);
}
