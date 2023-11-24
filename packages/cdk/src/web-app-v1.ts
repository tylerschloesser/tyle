import { App } from 'aws-cdk-lib'
import { BehaviorOptions } from 'aws-cdk-lib/aws-cloudfront'
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
  additionalBehaviors?: Record<string, BehaviorOptions>
}

export class WebAppV1 {
  readonly stack: Readonly<{
    dns: DnsStack
    cdnCertificate: CdnCertificateStack
    cdn: CdnStack
  }>

  constructor(
    app: App,
    {
      stackIdPrefix,
      account,
      domain,
      region,
      distPath,
      additionalBehaviors,
    }: WebAppV1Props,
  ) {
    const stackId = (suffix: string) =>
      [stackIdPrefix, suffix].join('-')

    const dns = new DnsStack(app, stackId('DNS'), {
      domain,
      env: {
        account,
        region,
      },
      crossRegionReferences: true,
    })

    const cdnCertificate = new CdnCertificateStack(
      app,
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

    const cdn = new CdnStack(app, stackId('CDN'), {
      domain,
      env: {
        account,
        region,
      },
      crossRegionReferences: true,
      appHostedZone: dns.appHostedZone,
      certificate: cdnCertificate.certificate,
      distPath,
      additionalBehaviors,
    })

    this.stack = { dns, cdnCertificate, cdn }
  }
}
