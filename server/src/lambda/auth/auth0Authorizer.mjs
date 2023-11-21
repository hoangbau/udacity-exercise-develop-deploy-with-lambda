import Axios from "axios";
import jsonwebtoken from "jsonwebtoken";
import { createLogger } from "../../utils/logger.mjs";

const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJLv6loZXa4n+SMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi03YWFsczZ6eHU0aDBscnhmLnVzLmF1dGgwLmNvbTAeFw0yMzExMjAw
MjU0NTlaFw0zNzA3MjkwMjU0NTlaMCwxKjAoBgNVBAMTIWRldi03YWFsczZ6eHU0
aDBscnhmLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAKbFRmN42HFMqe5es4X3Am95AceTRMIgC5pFG8UTGtD88bBbXL3RHsOb/cjW
QKUHRmOBMkBa9CKdK86vtZRWxyzEnbrSm6u4D2+LrmAJOpt4sdhb3Wj5ajbunJff
TrBXTQNxl3VwkD70Allvekc5LswoChQJ8aWRumAAKp4sIZ1szXNilUFx4e848Cfx
lwxmu8iIheS+jHxJa40DzniBAahIbz0EuORXlMLk7qqGb24hF/1GM6LgkaOhwJip
xIU0qClUwHwPLzVt7m9B8YJ1RzV3rZ1vvDuoyJjjh413H2KRbvZgEXk+fOtAmoVD
7QE5paFV2njETaqFl+1ZFdwAHiECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUVfcR1sT5+0wAY8pJdGq8YScIsJswDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCXya/g6rQ9bCQHgWk0LoQyT1P0qNSBgbpx3nqncQwJ
ewjZiXJHCyZbmeTbHu+R3whzxL1MPSTrKe+HMvTIt79QsHovmEL/ZLfSFxLQT3yD
lqe4VxajkvfxzybpbTbkGScKGVz78sXPu7QqcCxSSOfVEkXVfbMSeGtu+TISKuwY
kXA+AYPxAmIhMbJqNcx/CyL+DYV8TqJ4T0wdwGkZ7ieDCzQc+gSEoIrMwLK9DabE
17kx3CjFPPWgWSf418Dbiy8KZgluREYdTc/R0my33NHRXDDIqMXOK6ZyCeY8Ye47
gr24Yygvk+B2uF8hP6O7bwd7UI7X/w6KsDMe30YHs1ZB
-----END CERTIFICATE-----`;

const logger = createLogger("auth");

const jwksUrl =
  "https://dev-7aals6zxu4h0lrxf.us.auth0.com/.well-known/jwks.json";

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);
  const jwt = jsonwebtoken.decode(token, { complete: true });

  // TODO: Implement token verification
  jsonwebtoken.verify(token, certificate, { algorithms: ["RS256"] });
  return jwt;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
