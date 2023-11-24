import { Environment, Stack } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { HostedZone } from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import { CommonStackProps, Region } from './types.js'

export interface CdnCertificateStackProps
  extends CommonStackProps {
  appHostedZone: HostedZone
  env: Omit<Required<Environment>, 'region'> & {
    region: Region.US_EAST_1
  }
}

export class CdnCertificateStack extends Stack {
  public readonly certificate: Certificate
  constructor(
    scope: Construct,
    id: string,
    {
      domain,
      appHostedZone,
      ...props
    }: CdnCertificateStackProps,
  ) {
    super(scope, id, props)

    this.certificate = new Certificate(
      this,
      'Certificate',
      {
        domainName: domain.app,
        validation:
          CertificateValidation.fromDns(appHostedZone),
      },
    )
  }
}
