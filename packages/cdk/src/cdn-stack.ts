import { Stack } from 'aws-cdk-lib'
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager'
import {
  Distribution,
  FunctionAssociation,
  FunctionEventType,
  OriginAccessIdentity,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  HostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import {
  BucketDeployment,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import { DefaultToIndexHtmlFunction } from './default-to-index-html-function.js'
import { CommonStackProps } from './types.js'
import {
  WEBPACK_MANIFEST_FILE_NAME,
  getDefaultRootObject,
  getExtensions,
} from './webpack-manifest.js'

export interface CdnStackProps extends CommonStackProps {
  certificate: Certificate
  appHostedZone: HostedZone
  distPath: string
}

export class CdnStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    {
      domain,
      certificate,
      appHostedZone,
      distPath,
      ...props
    }: CdnStackProps,
  ) {
    super(scope, id, props)

    const bucket = new Bucket(this, 'Bucket', {
      bucketName: domain.app,
    })

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity',
    )

    const distribution = new Distribution(
      this,
      'Distribution',
      {
        defaultBehavior: {
          origin: new S3Origin(bucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy:
            ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          functionAssociations: [
            defaultToIndexHtml(this, distPath),
          ],
          responseHeadersPolicy: new ResponseHeadersPolicy(
            this,
            'ResponseHeadersPolicy',
            {
              customHeadersBehavior: {
                customHeaders: [
                  {
                    header: 'Cross-Origin-Opener-Policy',
                    value: 'same-origin',
                    override: false,
                  },
                  {
                    header: 'Cross-Origin-Embedder-Policy',
                    value: 'require-corp',
                    override: false,
                  },
                ],
              },
            },
          ),
        },
        defaultRootObject: getDefaultRootObject(distPath),
        domainNames: [domain.app],
        certificate,
      },
    )

    new BucketDeployment(this, 'BucketDeployment', {
      sources: [
        Source.asset(distPath, {
          exclude: [WEBPACK_MANIFEST_FILE_NAME],
        }),
      ],
      destinationBucket: bucket,
      prune: true,
    })

    new ARecord(this, 'AliasRecord', {
      zone: appHostedZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(distribution),
      ),
    })
  }
}

function defaultToIndexHtml(
  scope: Construct,
  distPath: string,
): FunctionAssociation {
  // prettier-ignore
  const ignoreRegex = `/\.(${getExtensions(distPath).join('|')})$/`
  return {
    function: new DefaultToIndexHtmlFunction(
      scope,
      'DefaultToIndexHtmlFunction',
      { ignoreRegex },
    ),
    eventType: FunctionEventType.VIEWER_REQUEST,
  }
}
