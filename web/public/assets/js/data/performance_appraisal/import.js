$(function(){
    "use strict"
    
    $('#exportExcel').on('click', function() {
        $('.buttons-excel').trigger('click')
    })
    

    function fileUploadEvent(id, target, target_name, target_url, btn_upload) 
    {
        // Get a reference to the file input
        // Get a reference to the file input
        const fileInput = document.getElementById(id)

        // Listen for the change event so we can capture the file
        fileInput.addEventListener('change', (e) => {
            // Get a reference to the file
            const file = e.target.files[0];
            // console.log(file)

            let file_exist = $('.file_evidence_size_total');
            let file_size = 0;
            if (!fileInput.value ||
                typeof fileInput.files === 'undefined' ||
                typeof fileInput.files[0] === 'undefined' ||
                typeof fileInput.files[0].size !== 'number'
            ) {
                file_size += 0
            }else {
                file_size += (file.size / 1024) / 1024
            }
            
            if(file_size > 15) {
                alertFailed(`File size limit exceeded.<br><span>Maximum limit is 15 MB</span>`)
                $("#"+target_name).val('')
                return false;
            }

            if(file['type'] === 'image/jpeg' || file['type'] === 'image/jpg'
                || file['type'] === 'image/png' 
                || file['type'] === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                || file['type'] === 'application/pdf'
                // || file['type'] === 'application/vnd.ms-powerpoint'
                || file['type'] === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                // || file['type'] === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )
                
                {
                    
            }else {
                alertFailed(`Invalid file format. <br><span>The file <b>${file['name']}</b> could not be uploaded. <br></br>Only files with the following extensions are allowed: <br><b>jpg, jpeg, png, pdf, docx and xlsx</b></span>`)
                $("#"+target_name).val('')
                
                return false;
            }

            document.getElementById(target_name).value = file['name']

            // Encode the file using the FileReader API
            const reader = new FileReader();
            reader.onloadend = () => {
                // Use a regex to remove data url part
                const base64String = reader.result
                    .replace('data:', '')
                    .replace(/^.+,/, '');

                

                document.getElementById(target).value = base64String

                const blob = b64toBlob(base64String, file.type);
                const blobUrl = URL.createObjectURL(blob);
                // console.log(target_url);
                document.getElementById(target_url).innerHTML = ''
                document.getElementById(target_url).innerHTML  = `<a target="_blank" style="color:#0277BD;white-space:wrap;width:70px;" href="${blobUrl}">${file['name']}</a>`

                document.getElementById(btn_upload).innerHTML = 'Replace'
                // Logs wL2dvYWwgbW9yZ...
            };
            reader.readAsDataURL(file);
        });
    }

    $(document).ready(function() {
        $('.upload-evidence').each(function(idx) {
            // console.log(idx)
            let id = `evidence${idx}`
            let target = `evidence_file${idx}`
            let target_name = `evidence_name${idx}`
            let target_url = `evidence_url${idx}`
            let btn_upload = `btn_evidence${idx}`
            
            fileUploadEvent(id, target, target_name, target_url, btn_upload);
        })
    })

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
          
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
      }
    
});