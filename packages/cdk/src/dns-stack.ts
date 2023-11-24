import { Stack } from 'aws-cdk-lib'
import {
  HostedZone,
  PublicHostedZone,
  RecordSet,
  RecordTarget,
  RecordType,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import invariant from 'tiny-invariant'
import { CommonStackProps } from './types.js'

export class DnsStack extends Stack {
  public readonly appHostedZone: HostedZone

  constructor(
    scope: Construct,
    id: string,
    { domain, ...props }: CommonStackProps,
  ) {
    super(scope, id, props)

    const rootHostedZone = PublicHostedZone.fromLookup(
      this,
      'HostedZone-Root',
      { domainName: domain.root },
    )

    this.appHostedZone = new PublicHostedZone(
      this,
      'HostedZone-App',
      { zoneName: domain.app },
    )

    invariant(this.appHostedZone.hostedZoneNameServers)
    new RecordSet(this, 'DnsRecord-NS-App', {
      recordType: RecordType.NS,
      recordName: this.appHostedZone.zoneName,
      target: RecordTarget.fromValues(
        ...this.appHostedZone.hostedZoneNameServers,
      ),
      zone: rootHostedZone,
    })
  }
}
