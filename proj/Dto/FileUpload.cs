using System.ComponentModel.DataAnnotations;

namespace proj.Dto
{
    public class FileUploaderRequest
    {
        public string UserId { get; set; }
        public string PlaceId { get; set; }
        public string Ext { get; set; }
        public string Filename { get; set; }
        
        public IFormFile Image { get; set; }

    }
}
