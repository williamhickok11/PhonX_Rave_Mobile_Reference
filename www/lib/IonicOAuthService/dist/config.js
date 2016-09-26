angular.module('ionicOAuthService.config', [])

.constant('FIREBASE_URL', 'https://fuber-auth.firebaseio.com/')

.constant('SOCIAL', {
	INVALID_PROVIDER: 'INVALID_PROVIDER',
	FACEBOOK: {
		PROVIDER: 'facebook',
		ID: '1780092688878921',
		SCOPE: ['public_profile', 'email'] //Put here the others scopes that you want
	},
	TWITTER: {
		PROVIDER: 'twitter',
		KEY: 'VCeCCnI1rxdyeKKEg4AsyBi8x',
		SECRET: '9F8APlneimBYI5Vs41Nwpge1JUzEchO6wUOrOg6vaydcgL6qMN'
	}
});