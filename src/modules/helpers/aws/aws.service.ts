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
  async uploadFileWithS3(file) {
    aws.config.update({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: 'us-east-1',
    });

    const s3 = new aws.S3();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${Date.now()}`,
      Body: await file.toBuffer(),
      ContentType: file.mimetype,
    };

    const uploadedImage = await s3
      .upload(params, async (err, data) => {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
      })
      .promise();

    return uploadedImage.Location as string;
  }

  // ! Finish with delete
  async deleteFileWithS3(fileName: string) {
    aws.config.update({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      region: 'eu-central-1',
    });

    const s3 = new aws.S3();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
    };

    return await s3
      .deleteObject(params, async (err, data) => {
        if (err) {
          throw err;
        }
        console.log(`File deleted successfully`, data);
      })
      .promise();
  }
}
