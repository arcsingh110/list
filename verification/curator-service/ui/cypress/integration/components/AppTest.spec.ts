/* eslint-disable no-undef */
describe('App', function () {
    beforeEach(() => {
        cy.task('clearSourcesDB', {});
    });

    it('takes user to home page when home button is clicked', function () {
        cy.login();
        cy.visit('/cases');
        cy.url().should('eq', 'http://localhost:3002/cases');

        cy.contains('Home');
        cy.contains('span', 'Home').click();
        cy.url().should('eq', 'http://localhost:3002/');
    });

    it('Shows charts on home page', function () {
        cy.visit('/');

        cy.contains('Completeness');
        cy.contains('Cumulative');
        cy.contains('Freshness');
    });

    it('shows login button when logged out', function () {
        cy.visit('/');

        cy.contains('Login');
    });

    it('shows logout button when logged in', function () {
        cy.login({ name: 'Alice Smith', email: 'alice@test.com', roles: [] });
        cy.visit('/');

        cy.contains('Logout alice@test.com');
    });

    it('Homepage with logged out user', function () {
        cy.visit('/');

        cy.contains('Create new').should('not.exist');
        cy.contains('Home');
        cy.contains('Linelist').should('not.exist');
        cy.contains('Sources').should('not.exist');
        cy.contains('Profile').should('not.exist');
        cy.contains('Manage users').should('not.exist');
    });

    it('Homepage with logged in user with no roles', function () {
        cy.login({ roles: [] });
        cy.visit('/');

        cy.contains('Create new').should('not.exist');
        cy.contains('Home');
        cy.contains('Linelist').should('not.exist');
        cy.contains('Sources').should('not.exist');
        cy.contains('Profile');
        cy.contains('Manage users').should('not.exist');
    });

    it('Homepage with logged in admin', function () {
        cy.login({ roles: ['admin'] });
        cy.visit('/');

        cy.contains('Create new').should('not.exist');
        cy.contains('Home');
        cy.contains('Linelist').should('not.exist');
        cy.contains('Sources').should('not.exist');
        cy.contains('Profile');
        cy.contains('Manage users');
    });

    it('Homepage with logged in curator', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/');

        cy.contains('Create new');
        cy.contains('Home');
        cy.contains('Linelist');
        cy.contains('Sources');
        cy.contains('Profile');
        cy.contains('Manage users').should('not.exist');
    });

    it('Homepage with logged in reader', function () {
        cy.login({ roles: ['reader'] });
        cy.visit('/');

        cy.contains('Create new').should('not.exist');
        cy.contains('Home');
        cy.contains('Linelist');
        cy.contains('Sources');
        cy.contains('Profile');
        cy.contains('Manage users').should('not.exist');
    });

    it('Can open new case modal from create new button', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/');

        cy.contains('Create new COVID-19 line list case').should('not.exist');
        cy.get('button[data-testid="create-new-button"]').click();
        cy.contains('li', 'New line list case').click();
        cy.contains('Create new COVID-19 line list case');
        cy.url().should('eq', 'http://localhost:3002/cases/new');
        cy.get('button[aria-label="close overlay"').click();
        cy.url().should('eq', 'http://localhost:3002/');
    });

    it('Can open bulk upload modal from create new button', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/');

        cy.get('button[data-testid="create-new-button"]').click();
        cy.contains('li', 'New bulk upload').click();
        cy.contains('New bulk upload');
        cy.url().should('eq', 'http://localhost:3002/cases/bulk');
        cy.get('button[aria-label="close overlay"').click();
        cy.url().should('eq', 'http://localhost:3002/');
    });

    it('Can open new automated source modal from create new button', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/');

        cy.get('button[data-testid="create-new-button"]').click();
        cy.contains('li', 'New automated source').click();
        cy.contains('New automated data source');
        cy.url().should('eq', 'http://localhost:3002/sources/automated');
        cy.get('button[aria-label="close overlay"').click();
        cy.url().should('eq', 'http://localhost:3002/');
    });

    it('Closing modal shows previous page', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/sources');
        cy.get('button[data-testid="create-new-button"]').click();
        cy.contains('li', 'New line list case').click();
        cy.url().should('eq', 'http://localhost:3002/cases/new');
        cy.get('button[aria-label="close overlay"').click();
        cy.url().should('eq', 'http://localhost:3002/sources');
    });

    it('Closing modal navigates to /cases if there is no previous location', function () {
        cy.login({ roles: ['curator'] });
        cy.visit('/cases/new');
        cy.get('button[aria-label="close overlay"').click();
        cy.url().should('eq', 'http://localhost:3002/cases');
    });
});
