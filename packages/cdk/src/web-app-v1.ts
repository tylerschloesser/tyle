import { App } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { CdnCertificateStack } from './cdn-certificate-stack.js'
import { CdnStack } from './cdn-stack.js'
import { DnsStack } from './dns-stack.js'
import { Domain, Region } from './types.js'

export interface WebAppV1Props {
  stackIdPrefix: string
  account: string
  domain: Domain
  region: Region
  distPath: string
}

export class WebAppV1 extends Construct {
  readonly stack: Readonly<{
    dns: DnsStack
    cdnCertificate: CdnCertificateStack
    cdn: CdnStack
  }>

  constructor(
    scope: App,
    id: string,
    {
      stackIdPrefix,
      account,
      domain,
      region,
      distPath,
    }: WebAppV1Props,
  ) {
    super(scope, id)

    const stackId = (suffix: string) =>
      [stackIdPrefix, suffix].join('-')

    const dns = new DnsStack(this, stackId('DNS'), {
      domain,
      env: {
        account,
        region,
      },
      crossRegionReferences: true,
    })

    const cdnCertificate = new CdnCertificateStack(
      this,
      stackId('CDN-Certificate'),
      {
        domain,
        env: {
          account,
          region: Region.US_EAST_1,
        },
        crossRegionReferences: true,
        appHostedZone: dns.appHostedZone,
      },
    )

    const cdn = new CdnStack(this, stackId('CDN'), {
      domain,
      env: {
        account,
        region,
      },
      crossRegionReferences: true,
      appHostedZone: dns.appHostedZone,
      certificate: cdnCertificate.certificate,
      distPath,
    })

    this.stack = { dns, cdnCertificate, cdn }
  }
}
