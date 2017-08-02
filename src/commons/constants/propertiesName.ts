/**
 * This module exports main property names that are provided by faker.js
 * More documentation can be found at: https://github.com/marak/Faker.js/
 */
export default {
  address: [
    'address', 'zipCode', 'city', 'cityPrefix', 'citySuffix', 'streetName', 'streetAddress',
    'streetSuffix', 'streetPrefix', 'secondaryAddress', 'county', 'country', 'countryCode',
    'state', 'stateAbbr', 'latitude', 'longitude',
  ],
  commerce: [
    'commerce', 'color', 'department', 'productName',
    'price', 'productAdjective', 'productMaterial',
    'product',
  ],
  company: [
    'company', 'suffixes', 'companyName', 'companySuffix',
    'catchPhrase', 'bs', 'catchPhraseAdjective',
    'catchPhraseDescriptor', 'catchPhraseNoun', 'bsAdjective',
    'bsBuzz',
    'bsNoun',
  ],
  database: [
    'database', 'column', 'type', 'collation',
    'engine',
  ],
  date: [
    'date', 'past', 'future', 'between',
    'recent', 'month', 'weekday',
  ],
  finance: [
    'finance', 'account', 'accountName', 'mask',
    'amount', 'transactionType', 'currencyCode',
    'currencyName', 'currencySymbol', 'bitcoinAddress',
    'iban', 'bic',
  ],
  hacker: [
    'hacker', 'abbreviation', 'adjective', 'noun',
    'verb', 'ingverb', 'phrase',
  ],
  helpers: [
    'helpers', 'randomize', 'slugify', 'replaceSymbolWithNumber',
    'replaceSymbols', 'shuffle', 'mustache',
    'createCard', 'contextualCard', 'userCard',
    'createTransaction',
  ],
  image: [
    'image', 'avatar', 'imageUrl',
    'abstract', 'animals', 'business',
    'cats', 'city', 'food',
    'nightlife', 'fashion', 'people',
    'nature', 'sports', 'technics',
    'transport', 'dataUri',
  ],
  internet: [
    'internet', 'avatar', 'email', 'exampleEmail',
    'userName', 'protocol', 'url',
    'domainName', 'domainSuffix', 'domainWord',
    'ip', 'ipv6', 'userAgent',
    'color', 'mac', 'password',
  ],
  lorem: [
    'lorem', 'word', 'words', 'sentence',
    'slug', 'sentences', 'paragraph',
    'paragraphs', 'text', 'lines',
  ],
  name: [
    'name', 'firstName', 'lastName', 'findName',
    'jobTitle', 'prefix', 'suffix',
    'title', 'jobDescriptor', 'jobArea',
    'jobType',
  ],
  phone: [
    'phone', 'phoneNumber',
    'phoneNumberFormat',
    'phoneFormats',
  ],
  random: [
    'random', 'number', 'arrayElement', 'objectElement',
    'uuid', 'boolean', 'word',
    'words', 'image', 'locale',
    'alphaNumeric',
  ],
  system: [
    'system', 'fileName', 'commonFileName', 'mimeType',
    'commonFileType', 'commonFileExt', 'fileType',
    'fileExt', 'directoryPath', 'filePath',
    'server',
  ],
};
