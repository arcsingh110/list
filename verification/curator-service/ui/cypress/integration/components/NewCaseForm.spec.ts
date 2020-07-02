/* eslint-disable no-undef */
describe('New case form', function () {
    beforeEach(() => {
        cy.task('clearCasesDB', {});
        cy.login();
    });

    afterEach(() => {
        cy.clearSeededLocations();
    });

    it('Can add full row to linelist', function () {
        cy.visit('/cases');
        cy.contains('No records to display');
        cy.seedLocation({
            country: 'France',
            geometry: { latitude: 45.75889, longitude: 4.84139 },
            name: 'France',
            geoResolution: 'Country',
        });
        cy.seedLocation({
            country: 'Germany',
            geometry: { latitude: 51.0968509, longitude: 5.9688274 },
            name: 'Germany',
            geoResolution: 'Country',
        });
        cy.seedLocation({
            country: 'United Kingdom',
            geometry: { latitude: 54.2316104, longitude: -13.4274035 },
            name: 'United Kingdom',
            geoResolution: 'Country',
        });

        cy.visit('/cases/new');
        cy.get('input[name="sourceUrl"]').type('www.example.com');
        cy.get('div[data-testid="sex"]').click();
        cy.get('li[data-value="Female"').click();
        cy.get('input[name="age"]').type('21');
        cy.get('div[data-testid="ethnicity"]').click();
        cy.get('li[data-value="Asian"').click();
        cy.get('div[data-testid="nationalities"]').type('Afghan');
        cy.get('li').first().should('contain', 'Afghan').click();
        cy.get('div[data-testid="nationalities"]').type('Albanian');
        cy.get('li').first().should('contain', 'Albanian').click();
        cy.get('div[data-testid="profession"]').type('Accountant');
        cy.get('li').first().should('contain', 'Accountant').click();
        cy.get('div[data-testid="location"]').type('France');
        cy.contains('France');
        cy.contains('Country');
        cy.get('li').first().should('contain', 'France').click();
        cy.get('input[name="confirmedDate"]').type('2020-01-01');
        cy.get('div[data-testid="methodOfConfirmation"]').click();
        cy.get('li[data-value="PCR test"').click();
        cy.get('input[name="onsetSymptomsDate"]').type('2020-01-02');
        cy.get('input[name="firstClinicalConsultationDate"]').type(
            '2020-01-03',
        );
        cy.get('input[name="selfIsolationDate"]').type('2020-01-04');
        cy.get('div[data-testid="admittedToHospital"]').click();
        cy.get('li[data-value="Yes"').click();
        cy.get('input[name="hospitalAdmissionDate"]').type('2020-01-05');
        cy.get('div[data-testid="admittedToIcu"]').click();
        cy.get('li[data-value="Yes"').click();
        cy.get('input[name="icuAdmissionDate"]').type('2020-01-06');
        cy.get('div[data-testid="outcome"]').click();
        cy.get('li[data-value="Recovered"').click();
        cy.get('input[name="outcomeDate"]').type('2020-01-07');
        cy.get('div[data-testid="symptoms"]').type('dry cough');
        cy.get('li').first().should('contain', 'dry cough').click();
        cy.get('div[data-testid="symptoms"]').type('mild fever');
        cy.get('li').first().should('contain', 'mild fever').click();
        cy.get('div[data-testid="hasPreexistingConditions"]').click();
        cy.get('li[data-value="Yes"').click();
        cy.get('div[data-testid="preexistingConditions"]').type(
            'ABCD syndrome',
        );
        cy.get('li').first().should('contain', 'ABCD syndrome').click();
        cy.get('div[data-testid="preexistingConditions"]').type(
            'ADULT syndrome',
        );
        cy.get('li').first().should('contain', 'ADULT syndrome').click();
        cy.get('div[data-testid="transmissionRoutes"]').click();
        cy.get('li').first().should('contain', 'Airborne infection').click();
        cy.get('div[data-testid="transmissionPlaces"]').click();
        cy.get('li').first().should('contain', 'Assisted Living').click();
        cy.get('input[placeholder="Contacted case IDs"').type(
            'testcaseid12345678987654\ntestcaseid12345678987655\n',
        );
        cy.get('div[data-testid="traveledPrior30Days"]').click();
        cy.get('li[data-value="Yes"').click();
        cy.get('button[data-testid="addTravelHistory"').click();
        cy.get('div[data-testid="travelHistory[0].location"]').type('Germany');
        cy.get('li').first().should('contain', 'Germany').click();
        cy.get('input[name="travelHistory[0].dateRange.start"]').type(
            '2020-01-06',
        );
        cy.get('input[name="travelHistory[0].dateRange.end"]').type(
            '2020-01-07',
        );
        cy.get('div[data-testid="travelHistory[0].purpose"]').click();
        cy.get('li[data-value="Business"').click();
        cy.get('div[data-testid="travelHistory[0].methods"]').type('Car');
        cy.get('li').first().should('contain', 'Car').click();
        cy.get('div[data-testid="travelHistory[0].methods"]').type('Plane');
        cy.get('li').first().should('contain', 'Plane').click();
        cy.get('button[data-testid="addTravelHistory"').click();
        cy.get('div[data-testid="travelHistory[1].location"]').type(
            'United Kingdom',
        );
        cy.get('li').first().should('contain', 'United Kingdom').click();
        cy.get('input[name="travelHistory[1].dateRange.start"]').type(
            '2020-01-01',
        );
        cy.get('input[name="travelHistory[1].dateRange.end"]').type(
            '2020-01-05',
        );
        cy.get('div[data-testid="travelHistory[1].purpose"]').click();
        cy.get('li[data-value="Business"').click();
        cy.get('div[data-testid="travelHistory[1].methods"]').type('Bus');
        cy.get('li').first().should('contain', 'Bus').click();
        cy.get('button[data-testid="addGenomeSequence"').click();
        cy.get('input[name="genomeSequences[0].sampleCollectionDate"]').type(
            '2020-01-01',
        );
        cy.get('input[name="genomeSequences[0].repositoryUrl"]').type(
            'www.example2.com',
        );
        cy.get('input[name="genomeSequences[0].sequenceId"]').type(
            'testSequenceId',
        );
        cy.get('input[name="genomeSequences[0].sequenceName"]').type(
            'test sequence name',
        );
        cy.get('input[name="genomeSequences[0].sequenceLength"]').type('33000');
        cy.get('div[data-testid="pathogens"]').type('Bartonella');
        cy.get('li').first().should('contain', 'Bartonella').click();
        cy.get('div[data-testid="pathogens"]').type('Ebola');
        cy.get('li').first().should('contain', 'Ebola').click();
        cy.get('textarea[name="notes"]').type('test notes\non new line');
        cy.server();
        cy.route('POST', '/api/cases').as('addCase');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@addCase');
        cy.contains('Case added');

        cy.visit('/cases');
        cy.contains('No records to display').should('not.exist');
        cy.contains('www.example.com');
        cy.contains('Female');
        cy.contains('21');
        cy.contains('Asian');
        cy.contains('Afghan, Albanian');
        cy.contains('Accountant');
        cy.contains('France');
        cy.contains('1/1/2020');
        cy.contains('dry cough, mild fever');
        cy.contains('Airborne infection');
        cy.contains('Assisted Living');
        cy.contains('testcaseid12345678987654, testcaseid12345678987655');
        cy.contains('Germany, United Kingdom');
        cy.contains('Bartonella, Ebola');
        cy.contains('test notes');
        cy.contains('on new line');
        cy.contains('superuser@');
    });

    it('Can add minimal row to linelist', function () {
        cy.visit('/cases');
        cy.contains('No records to display');
        cy.seedLocation({
            country: 'France',
            geometry: { latitude: 45.75889, longitude: 4.84139 },
            name: 'France',
            geoResolution: 'Country',
        });

        cy.visit('/cases/new');
        cy.get('input[name="sourceUrl"]').type('www.example.com');
        cy.get('div[data-testid="location"]').type('France');
        cy.contains('France');
        cy.contains('Country');
        cy.get('li').first().should('contain', 'France').click();
        cy.get('input[name="confirmedDate"]').type('2020-01-01');
        cy.get('div[data-testid="methodOfConfirmation"]').click();
        cy.get('li[data-value="PCR test"').click();
        cy.server();
        cy.route('POST', '/api/cases').as('addCase');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@addCase');
        cy.contains('Case added');

        cy.visit('/cases');
        cy.contains('No records to display').should('not.exist');
        cy.contains('www.example.com');
        cy.contains('France');
        cy.contains('1/1/2020');
    });

    it('Can submit events without dates', function () {
        cy.visit('/cases');
        cy.contains('No records to display');
        cy.seedLocation({
            country: 'France',
            geometry: { latitude: 45.75889, longitude: 4.84139 },
            name: 'France',
            geoResolution: 'Country',
        });

        cy.visit('/cases/new');
        cy.get('input[name="sourceUrl"]').type('www.example.com');
        cy.get('div[data-testid="location"]').type('France');
        cy.contains('France');
        cy.contains('Country');
        cy.get('li').first().should('contain', 'France').click();
        cy.get('input[name="confirmedDate"]').type('2020-01-01');
        cy.get('div[data-testid="methodOfConfirmation"]').click();
        cy.get('li[data-value="PCR test"').click();
        // Outcome without a date.
        cy.get('div[data-testid="outcome"]').click();
        cy.get('li[data-value="Recovered"').click();
        // Hospital admission without a date.
        cy.get('div[data-testid="admittedToHospital"]').click();
        cy.get('li[data-value="Yes"').click();
        // ICU admission without a date.
        cy.get('div[data-testid="admittedToIcu"]').click();
        cy.get('li[data-value="Yes"').click();
        cy.server();
        cy.route('POST', '/api/cases').as('addCase');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@addCase');

        cy.visit('/cases');
        cy.contains('No records to display').should('not.exist');
        cy.contains('www.example.com');
        cy.contains('France');
        cy.contains('1/1/2020');
        cy.contains('Yes');
        cy.contains('Recovered');
    });

    it('Does not add row on submission error', function () {
        // Avoid geolocation fail, the "Request failed" check below happens at the data service level.
        cy.seedLocation({
            name: 'France',
            geometry: { latitude: 42, longitude: 12 },
            country: 'France',
            geoResolution: 'Country',
        });
        cy.visit('/cases');
        cy.contains('No records to display');

        cy.visit('/cases/new');
        cy.get('input[name="sourceUrl"]').type('www.example.com');
        cy.get('div[data-testid="location"]').type('France');
        cy.contains('France');
        cy.contains('Country');
        cy.get('li').first().should('contain', 'France').click();
        cy.get('input[name="confirmedDate"]').type('2020-01-01');
        cy.get('div[data-testid="methodOfConfirmation"]').click();
        cy.get('li[data-value="PCR test"').click();
        cy.server();
        // Force server to return error
        cy.route({
            method: 'POST',
            url: '/api/cases',
            status: 422,
            response: {},
        }).as('addCase');
        cy.get('button[data-testid="submit"]').click();
        cy.wait('@addCase');
        cy.contains('Request failed');

        cy.visit('/cases');
        cy.contains('No records to display');
    });

    it('Check for required fields', function () {
        cy.visit('/cases/new');
        cy.get('button[data-testid="submit"]').click();

        cy.get('p:contains("Required field")').should('have.length', 4);
    });

    it('Shows checkbox on field completion', function () {
        cy.visit('/cases/new');
        cy.get('svg[data-testid="check-icon"]').should('not.exist');
        cy.get('div[data-testid="sex"]').click();
        cy.get('li[data-value="Female"').click();
        cy.get('svg[data-testid="check-icon"]').should('exist');
    });

    it('Shows error icon on field submission error', function () {
        cy.visit('/cases/new');
        cy.get('svg[data-testid="error-icon"]').should('not.exist');
        cy.get('svg[data-testid="check-icon"]').should('not.exist');
        cy.get('input[name="confirmedDate"]').type('2020/02/31').blur();
        cy.get('svg[data-testid="error-icon"]').should('exist');
        cy.get('svg[data-testid="check-icon"]').should('not.exist');
    });
});
