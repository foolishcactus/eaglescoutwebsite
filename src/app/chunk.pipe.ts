import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chunk',
  standalone: true,
})
export class ChunkPipe implements PipeTransform {
  transform(arr: any[], chunkSize: number): any[][] {
    if (!arr.length) {
      return [];
    }
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
}
