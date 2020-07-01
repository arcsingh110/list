/* eslint-disable no-undef */
describe('Bulk upload form', function () {
    beforeEach(() => {
        cy.task('clearCasesDB', {});
        cy.login();
        cy.seedLocation({
            country: 'Canada',
            admin1: 'Alberta',
            admin3: 'Banff',
            geometry: { latitude: 51.1784, longitude: 115.5708 },
            name: 'Banff',
            geoResolution: 'Admin3',
        });
    });

    // TODO: Test more fields here via the case details UI.
    it('Can upload CSV', function () {
        cy.visit('/cases');
        cy.contains('No records to display');

        cy.visit('/cases/bulk');
        const csvFixture = '../fixtures/bulk_data.csv';
        cy.get('input[type="file"]').attachFile(csvFixture);
        cy.server();
        cy.route('PUT', '/api/cases').as('upsertCase');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@upsertCase');
        cy.wait('@upsertCase');
        cy.contains('Success!');

        cy.visit('/cases');
        // Common data.
        cy.contains('No records to display').should('not.exist');
        cy.contains('Male');
        cy.contains('42');
        cy.contains('Canada');
        cy.contains('Alberta');
        cy.contains('Banff');
        // First record.
        cy.contains('foo.bar');
        // Second record.
        cy.contains('bar.baz');
    });

    it('Upserts data', function () {
        cy.visit('/cases');
        cy.contains('No records to display');

        cy.visit('/cases/bulk');
        const csvFixture = '../fixtures/bulk_data.csv';
        cy.get('input[type="file"]').attachFile(csvFixture);
        cy.server();
        cy.route('PUT', '/api/cases').as('upsertCases');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@upsertCases');
        cy.contains('Success!');

        cy.visit('/cases');
        cy.contains('No records to display').should('not.exist');
        cy.contains('foo.bar');
        cy.contains('new.url').should('not.exist');

        cy.visit('/cases/bulk');
        const updatedCsvFixture = '../fixtures/updated_bulk_data.csv';
        cy.get('input[type="file"]').attachFile(updatedCsvFixture);
        cy.server();
        cy.route('PUT', '/api/cases').as('upsertCases');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@upsertCases');
        cy.contains('Success!');

        cy.visit('/cases');
        cy.contains('foo.bar').should('not.exist');
        cy.contains('new.url');
    });

    it('Does not upload bad data', function () {
        cy.visit('/cases');
        cy.contains('No records to display');

        cy.visit('/cases/bulk');
        const csvFixture = '../fixtures/bad_bulk_data.csv';
        cy.get('input[type="file"]').attachFile(csvFixture);
        cy.server();
        cy.route('PUT', '/api/cases').as('upsertCases');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@upsertCases');
        cy.contains('Request failed');

        cy.visit('/cases');
        cy.contains('No records to display');
    });
});
