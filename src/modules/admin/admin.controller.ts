import { Controller } from '@nestjs/common';
import { AdminService } from './admin.service';

//* Admin Operation (user info change, check investments, and other info)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
}
