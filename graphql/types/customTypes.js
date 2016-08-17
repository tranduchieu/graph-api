import {
  GraphQLScalarType,
} from 'graphql';

import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

const validateStringType = (params) => {
  const { name: typeName, min, max, regex } = params;
  return new GraphQLScalarType({
    name: typeName,
    serialize: value => {
      return value;
    },
    parseValue: value => {
      return value;
    },
    parseLiteral: ast => {
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(`Query error: Can only parse strings got a: + ${ast.kind}`, [ast]);
      }
      if (ast.value.length < min) {
        throw new GraphQLError(`Query error: minimum length of ${params.min} required: `, [ast]);
      }
      if (ast.value.length > max) {
        throw new GraphQLError(`Query error: maximum length is ${params.max}: `, [ast]);
      }
      if (regex !== null) {
        if (!params.regex.test(ast.value)) {
          throw new GraphQLError(`Query error: Not a valid ${params.name}: `, [ast]);
        }
      }
      return ast.value;
    },
  });
};

export const EmailType = validateStringType({
  name: 'Email',
  min: 4,
  max: 254,
  regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
});

export const MobilePhoneType = validateStringType({
  name: 'MobilePhone',
  min: 10,
  max: 11,
  // regex: new RegExp(['/^(',
  //                   '091|094|0123|0124|0125|0127|0129|088|', // Vinaphone
  //                   '090|093|0120|0121|0122|0126|0128|089|', // MobiPhone
  //                   '098|097|096|0169|0168|0167|0166|0165|0164|0163|0162|086|', // Viettel
  //                   '092|0186|0188|', // Vietnamobile
  //                   '0199|099|0993|0994|0995|0996|', // Beeline
  //                   '095', // S-fone
  //                   ')\d{7}$/']).join(''),

  regex: `/^(
          091|094|0123|0124|0125|0127|0129|088|
          090|093|0120|0121|0122|0126|0128|089|
          098|097|096|0169|0168|0167|0166|0165|0164|0163|0162|086|
          092|0186|0188|
          0199|099|0993|0994|0995|0996|
          095
          )\d{7}$/`,
});

export const UrlType = validateStringType({
  name: 'URL',
  regex: `/^(
          (http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/`,
});
