A simple checklist to reference when doing a release from the development branch to the production branch

### Prior to release:

- [ ] Announce in the channel about the migration at least 2 days prior. State the expected start and end time of the migration.
- [ ] Ensure that the changes staged for production are merged into the production branch.
- [ ] Make a backup copy of the frontend and backend container images in case a rollback is required.

### During release:

- [ ] Access the production server via SSH.
- [ ] Stop all running Docker containers.
- [ ] Create a dump of the Postgres database for backup in case a rollback is required. **Note:** This step is done after all running containers are stopped to ensure data consistency.
- [ ] Checkout the latest production branch changes.
- [ ] Rebuild the containers.
- [ ] Start the containers.

### Post-release:

- [ ] Once all the containers have started, smoke test the newly deployed production build.
- [ ] If everything goes as planned, announce in the channel that the migration has completed.

### Rollback (if requried):

If the latest production build has issues and require a rollback, follow the steps listed below.

- [ ] Stop the frontend and backend containers.
- [ ] Run the backup images of both the frontend and backend Docker containers from earlier.
- [ ] If the database schema has changed or the data is lost, restore the Postgres database using the dump. **Note:** If the database scehma or data is intact, you can skip this step.
