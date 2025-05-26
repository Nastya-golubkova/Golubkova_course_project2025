namespace proj.Dto
{
    public class PhotoDto
    {
        public string UserId { get; set; }
        public string PlaceId { get; set; }
        public byte[]? Image { get; set; }

        public string Filename { get; set; }
        public string Ext { get; set; }

    }
}
