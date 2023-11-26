/* eslint-disable @typescript-eslint/no-var-requires */
const aws = require('aws-sdk');

import { Injectable } from '@nestjs/common';

export const getKeyForAwsImage = (image) => {
  let finish;

  if (image.includes('amazonaws.com/')) {
    finish = image.split('amazonaws.com/')[1];
  } else {
    finish = image;
  }

  if (finish.includes(['.png', '.jpg'])) {
    finish = finish.substring(0, finish.length - 4);
  }

  if (finish.includes(['.jpeg', '.webp'])) {
    finish = finish.substring(0, finish.length - 5);
  }

  return finish;
};

@Injectable()
export class AwsService {
  s3;

  constructor() {
    aws.config.update({
      region: 'us-east-1',
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    });

    this.s3 = new aws.S3();
  }

  async uploadFileWithS3(file) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}`,
      Body: await file.toBuffer(),
      ContentType: file.mimetype,
    };

    const uploadedImage = await this.s3
      .upload(params, async (err, data) => {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
      })
      .promise();

    return uploadedImage.Location as string;
  }

  async deleteFileWithS3(fileUrl: string) {
    const fileName = getKeyForAwsImage(fileUrl);

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
    };

    return await this.s3
      .deleteObject(params, async (err, data) => {
        if (err) {
          throw err;
        }
        console.log(`File deleted successfully`, data);
      })
      .promise();
  }
}
