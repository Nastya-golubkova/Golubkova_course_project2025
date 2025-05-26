using proj.db;

namespace proj.Dto
{
    public class GetPlaceDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public float Lat {  get; set; }
        public float Lon { get; set; }
        public List<Photo> Photos { get; set; }
    }
}
