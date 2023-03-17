// enum TAG {
//     End,
//     Byte,
//     Short,
//     Int,
//     Long,
//     Float,
//     Double,
//     Byte_Array,
//     String,
//     List,
//     Compound,
//     Int_Array,
//     Long_Array,
// }

// class Data extends Buffer {
//     working_object: { [key: string]: any } = {};
//     index = 0;
// }

// function readMeta(type: string, data: Data) {
//     var result: number = 0;
//     switch (type) {
//         case 'uint8':
//             result = data.readUInt8(data.index)
//             data.index += 1
//             break;
//         case 'uint16':
//             result = data.readUInt16LE(data.index)
//             data.index += 2
//             break;
//         case 'uint32':
//             result = data.readUInt32LE(data.index)
//             data.index += 4
//             break;
//         default:
//             break;
//     }
//     return result;
// }

// function readEntry(data: Data) {
//     // read tag
//     const tag = readMeta('uint8', data);
//     // read name
//     const name = readData(TAG.String, data);
//     // read entry
//     data.working_object[name] = readData(tag, data)
// }

// function readData(tag: TAG, data: Data): any {
//     var result, length;
//     switch (tag) {
//         case TAG.End:
//             break;
//         case TAG.Byte:
//             result = data.readInt8(data.index);
//             data.index += 1;
//             break;
//         case TAG.Short:
//             result = data.readInt16LE(data.index);
//             data.index += 2;
//             break;
//         case TAG.Int:
//             result = data.readInt32LE(data.index);
//             data.index += 4;
//             break;
//         case TAG.Long:
//             result = data.readBigInt64LE(data.index).toString();
//             data.index += 8;
//             break;
//         case TAG.Float:
//             result = data.readFloatLE(data.index);
//             data.index += 4;
//             break;
//         case TAG.Double:
//             result = data.readDoubleLE(data.index);
//             data.index += 8;
//             break;
//         case TAG.Byte_Array:
//             length = readData(TAG.Int, data);

//             result = [];
//             for (let i = 0; i < length; ++i) {
//                 result.push(readData(TAG.Byte, data));
//             }
//             break;
//         case TAG.String:
//             length = readMeta('uint16', data);
//             result = data.subarray(data.index, data.index + length).toString();
//             data.index += length;
//             break;
//         case TAG.List:
//             const type = readMeta('uint8', data);
//             length = readMeta('uint16', data);

//             result = []
//             for (let i = 0; i < length; ++i) {
//                 result.push(readData(type, data))
//             }
//             break;
//         case TAG.Compound:
//             const obj = data.working_object
//             data.working_object = {}

//             while (data[data.index] != TAG.End) {
//                 readEntry(data)
//             }
//             data.index += 1;
//             result = data.working_object
//             data.working_object = obj
//             break;
//         case TAG.Int_Array:
//             length = readMeta('uint32', data);

//             result = []
//             for (let i = 0; i < length; ++i) {
//                 result.push(readData(TAG.Int, data))
//             }
//             break;
//         case TAG.Long_Array:
//             length = readMeta('uint32', data);

//             result = []
//             for (let i = 0; i < length; ++i) {
//                 result.push(readData(TAG.Long, data))
//             }
//             break;

//         default:
//             break;
//     }
//     return result
// }

// export function nbtToJson(buffer: Buffer) {
//     const data = buffer as Data;
//     data.index = 3;
//     data.working_object = {}
//     return readData(TAG.Compound, data)
// }
