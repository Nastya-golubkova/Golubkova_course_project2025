using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace proj.Dto
{
    public class BlobDto
    {
        public string fileName {  get; set; }
        public string extension { get; set; }
        public byte[] thumbnailBytes { get; set; }
    }
}
