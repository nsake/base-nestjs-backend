import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Counters, CountersDocument, TCountersName } from './counters.model';

@Injectable()
export class CountersService {
  constructor(
    @InjectModel(Counters.name)
    private readonly countersModel: Model<CountersDocument>,
  ) {}

  async initCounter(counterName: TCountersName) {
    const insertCounter = {
      [counterName]: 1,
    };

    await this.countersModel.create({ insertCounter });

    return 1;
  }

  async findCounterAndIncrease(counterName: TCountersName) {
    const counters = (await this.countersModel.findOne().exec()) as any;

    if (counters) {
      const counter = counters[counterName];

      if (counter === null || counter === undefined)
        return await this.initCounter(counterName);

      const newCountValue = counter === 0 ? 1 : counter + 1;

      const updateValue = {
        ...counters._doc,
        [counterName]: newCountValue,
      };

      await this.countersModel.updateOne(
        { _id: counters._doc._id },
        updateValue,
      );

      return newCountValue;
    }

    return await this.initCounter(counterName);
  }

  async update(id: string, payload: any) {
    return this.countersModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }
}
