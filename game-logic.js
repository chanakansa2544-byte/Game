let shopName = "";
let energy = 100;
let gold = 50;
let stars = 0;
let shields = 0;

let currentCaseNum = 1;
const maxCases = 6;
let currentCaseData = null;
let gamePool = [];

// คลังข้อความเทคนิคกรณีเช็กแล้ว "เครื่องปกติ" (ไม่ใช้ข้อความตายตัวแล้ว)
const normalToolMessages = {
    'beep': "🔊 BEEP CODE: สถานะปกติ ไม่พบรหัสเสียงความผิดปกติ (POST Passed)",
    'led': "💡 DEBUG LED: ลำดับบูตปกติ (CPU->DRAM->VGA->BOOT สถานะ PASS)",
    'task': "📊 TASK MGR: ทรัพยากรระบบปกติ (CPU/RAM/Disk ไม่พบภาวะคอขวด)",
    'hw': "🌡️ HW MONITOR: อุณหภูมิ < 65°C, แรงดันไฟ (12V/5V/3.3V) เสถียร"
};

// คลังข้อสอบ Mega Pool 30 สถานการณ์
const masterCasePool = [
    { symptom: "เปิดเครื่องติด พัดลมหมุน แต่ไม่มีภาพขึ้นจอ", tool: "beep", toolHint: "🔊 Beep Code: ดังยาว 1 สั้น 2", correct: "ถอด RAM ออกมาใช้ยางลบขัดทำความสะอาดหน้าสัมผัส", wrong: ["ตรวจสอบปลั๊กไฟและเปลี่ยน Power Supply ใหม่", "ฟอร์แมตฮาร์ดดิสก์และลงระบบปฏิบัติการใหม่", "ถอดซิงก์ระบายความร้อนเพื่อเปลี่ยนซิลิโคน CPU"] },
    { symptom: "ใช้งานไปได้ 15 นาที เครื่องดับเอง พัดลมเสียงดัง", tool: "hw", toolHint: "🌡️ HWMonitor: CPU อุณหภูมิ 98°C", correct: "เช็ดซิลิโคนเก่าออกแล้วทำการทาซิลิโคน CPU ใหม่", wrong: ["ถอดการ์ดจอออกมาทำความสะอาดพัดลมระบายความร้อน", "ติดตั้งโปรแกรมแอนตี้ไวรัสและทำการ Full Scan", "เพิ่มความจุ RAM เพื่อลดภาระการทำงานของเครื่อง"] },
    { symptom: "เปิดเครื่องติด แต่ไฟ Debug LED ค้างที่คำว่า BOOT", tool: "led", toolHint: "💡 Debug LED: ค้างที่ BOOT", correct: "เข้าไปตั้งค่าลำดับการบูต (Boot Order) ใน BIOS", wrong: ["ตรวจสอบสาย LAN ว่าเชื่อมต่อกับเครือข่ายแน่นหรือไม่", "ถอด RAM ออกมาทำความสะอาดและใส่กลับเข้าไปใหม่", "ถอดถ่าน BIOS ทิ้งไว้ 5 นาทีเพื่อรีเซ็ตค่ากลับคืน"] },
    { symptom: "เครื่องกระตุกมาก เปิดโปรแกรมช้า แฮงก์บ่อย", tool: "task", toolHint: "📊 Task Manager: Disk ทำงาน 100%", correct: "เปลี่ยนฮาร์ดดิสก์หลักจากแบบ HDD เป็นแบบ SSD", wrong: ["เปลี่ยนสายสัญญาณจอภาพใหม่เพื่อลดอาการกระตุก", "ดาวน์โหลดและอัปเดตไดรเวอร์การ์ดจอเวอร์ชันล่าสุด", "ถอด RAM ทั้งหมดออกมาใช้ยางลบขัดหน้าสัมผัสทองเหลือง"] },
    { symptom: "เปิดไม่ติดเลย พัดลมไม่หมุน ไฟไม่เข้าเมนบอร์ด", tool: "hw", toolHint: "🔌 เช็กสายไฟ: ปลั๊กเสียบแน่นปกติ ไม่มีไฟรั่ว", correct: "ทำการเปลี่ยน Power Supply (PSU) ตัวใหม่ทดแทน", wrong: ["เปลี่ยนถ่าน BIOS บนเมนบอร์ดเนื่องจากแบตเตอรี่หมด", "ถอด RAM ออกมาทำความสะอาดเพื่อแก้ปัญหาไฟไม่เข้า", "ถอดซิงก์ระบายความร้อนเพื่อทาซิลิโคน CPU ใหม่"] },
    { symptom: "เล่นเกมภาพแตกเป็นเส้นๆ (Artifact) แล้วค้าง", tool: "led", toolHint: "💡 Debug LED: ค้างที่ VGA", correct: "ถอดการ์ดจอออกมาตรวจสอบ หรือส่งเคลมศูนย์บริการ", wrong: ["ทำการลงระบบปฏิบัติการ Windows ใหม่เพื่อล้างไวรัส", "อัปเกรด CPU ให้มีประสิทธิภาพสูงขึ้นเพื่อลดคอขวด", "ถอด RAM สลับสล็อตการติดตั้งเพื่อแก้ปัญหาจอภาพ"] },
    { symptom: "ต่อสาย LAN แล้วแต่เน็ตไม่มา ขึ้นรูปกากบาทสีแดง", tool: "hw", toolHint: "🔌 Cable Tester: ไฟติดไม่ครบ 8 เส้น", correct: "ทำการเข้าหัวสาย LAN ใหม่ หรือเปลี่ยนสาย LAN ใหม่", wrong: ["เข้าไปรีเซ็ตค่าเครือข่ายและการบูตในหน้า BIOS ใหม่", "ลงไดรเวอร์ Network ใหม่ และอัปเดตระบบปฏิบัติการ", "เปลี่ยน Power Supply เพราะจ่ายไฟให้การ์ดแลนไม่พอ"] },
    { symptom: "เปิดเครื่องเจอจอฟ้า (BSOD) รหัส Memory Management", tool: "beep", toolHint: "🔊 Beep Code: เสียงดังสั้น 3 ครั้ง", correct: "สลับแถว RAM เพื่อทดสอบ หรือเปลี่ยน RAM แถวที่เสีย", wrong: ["ทำความสะอาดพัดลมระบายความร้อนและทาซิลิโคน CPU", "เข้า Safe Mode เพื่อถอนการติดตั้งไดรเวอร์การ์ดจอ", "ทำการฟอร์แมตฮาร์ดดิสก์และลง Windows ใหม่ทั้งหมด"] },
    { symptom: "เครื่องส่งเสียงร้องเตือนต่อเนื่องไม่หยุดเมื่อกดปุ่มเปิด", tool: "beep", toolHint: "🔊 Beep Code: ดังยาวต่อเนื่องไม่หยุด", correct: "ตรวจสอบการติดตั้ง RAM ว่าเสียบลงสล็อตแน่นสนิทหรือไม่", wrong: ["เปลี่ยนแบตเตอรี่ CMOS บนเมนบอร์ดเนื่องจากไฟหมด", "เปลี่ยนสายสัญญาณเชื่อมต่อระหว่างจอภาพและตัวเครื่อง", "เคลียร์ฝุ่นบริเวณพัดลมระบายความร้อนของการ์ดจอ"] },
    { symptom: "Windows มองเห็น RAM เพียงครึ่งเดียวจากที่ติดตั้งไว้", tool: "task", toolHint: "📊 Task Manager: Hardware Reserved กินพื้นที่ RAM สูงมาก", correct: "ถอด RAM ทั้งหมดมาทำความสะอาดและใส่กลับให้ถูก Dual Channel", wrong: ["เข้าไปอัปเดตไดรเวอร์ของการ์ดจอให้เป็นเวอร์ชันล่าสุด", "ใช้โปรแกรมสแกนไวรัสแบบ Full Scan เพื่อลบมัลแวร์", "เปลี่ยน Power Supply เพราะจ่ายไฟให้เมนบอร์ดไม่พอ"] },
    { symptom: "เล่นเกมแล้วเฟรมเรตตกฮวบ เครื่องหน่วงผิดปกติ", tool: "task", toolHint: "📊 Task Manager: CPU วิ่งที่ 0.8 GHz ตลอดเวลา", correct: "ตรวจสอบชุดระบายความร้อน CPU ว่าประกบแนบสนิทหรือไม่", wrong: ["เปลี่ยนสาย LAN เป็นสาย Cat6 เพื่อเพิ่มความเร็วเน็ต", "ถอดการ์ดจอส่งเคลมศูนย์บริการเนื่องจากชิปประมวลผลพัง", "ปรับความละเอียดจอภาพให้ลดลงเพื่อลดการทำงานฮาร์ดดิสก์"] },
    { symptom: "เปิดเครื่องปุ๊บ พัดลม CPU หมุนกระตุกแล้วดับทันที", tool: "led", toolHint: "💡 Debug LED: ไฟ CPU กะพริบสั้นๆ แล้วดับ", correct: "ตรวจสอบสายไฟเลี้ยง CPU (4-pin/8-pin) ว่าเสียบแน่นหรือไม่", wrong: ["เข้าไปตั้งค่าลำดับการบูต (Boot Order) ในหน้าต่าง BIOS", "ใช้ยางลบขัดหน้าสัมผัสทองเหลืองของการ์ดแสดงผล (VGA)", "เปลี่ยนฮาร์ดดิสก์เป็น SSD เพราะอ่านข้อมูลระบบไม่ทัน"] },
    { symptom: "หน้าจอมืดสนิท แต่มีเสียงเข้า Windows และพิมพ์งานได้", tool: "hw", toolHint: "🔌 ตรวจสอบกายภาพ: สายไฟเลี้ยงการ์ดจอเสียบครบ จอเปิดติด", correct: "ตรวจสอบสายสัญญาณ (HDMI/DP) และสลับช่องเสียบจอภาพ", wrong: ["ถอดซิงก์ระบายความร้อนเพื่อทาซิลิโคน CPU ใหม่ทันที", "เข้าไปปรับค่า Boot Order ใน BIOS ให้เลือกบูตจาก SSD", "เปลี่ยน Power Supply เพราะจ่ายไฟให้ระบบไม่เพียงพอ"] },
    { symptom: "เครื่องเปิดติด ภาพขึ้น แต่ความละเอียดหน้าจอล็อกไว้ต่ำมาก", tool: "task", toolHint: "📊 Task Manager: มองไม่เห็นชื่อรุ่นการ์ดจอในแท็บ Performance", correct: "ดาวน์โหลดและติดตั้งไดรเวอร์การ์ดจอเวอร์ชันล่าสุดให้ตรงรุ่น", wrong: ["ถอด RAM ออกมาขัดหน้าสัมผัสด้วยยางลบแล้วใส่กลับเข้าที่", "อัปเดตระบบปฏิบัติการ Windows เพื่อซ่อมแซมไฟล์ระบบ Boot", "เปลี่ยนหน้าจอคอมพิวเตอร์ใหม่เนื่องจากจอหมดอายุการใช้งาน"] },
    { symptom: "เปิดเครื่องมาเจอข้อความ No Bootable Device Found", tool: "led", toolHint: "💡 Debug LED: ค้างที่ไฟ BOOT", correct: "เข้าไปตรวจสอบสถานะฮาร์ดดิสก์และตั้งค่า Boot Order ใน BIOS", wrong: ["ทำการเข้าหัวสาย LAN ใหม่ด้วยคีมย้ำสายเพื่อรับสัญญาณเน็ต", "ถอดการ์ดจอออกแล้วใช้การ์ดจอออนบอร์ดเพื่อทดสอบภาพ", "เปลี่ยนแบตเตอรี่ CMOS เพื่อแก้ปัญหาเวลาของเครื่องเดินไม่ตรง"] },
    { symptom: "มีเสียงดังคลิกๆ แก๊กๆ ออกมาจากภายในเคสคอมพิวเตอร์", tool: "hw", toolHint: "🪛 ตรวจสอบกายภาพ: เสียงดังมาจากบริเวณช่องใส่ฮาร์ดดิสก์ HDD", correct: "สำรองข้อมูลด่วนและเตรียมตัวเปลี่ยนฮาร์ดดิสก์ลูกใหม่", wrong: ["ทำการเป่าฝุ่นและหยอดน้ำมันหล่อลื่นที่พัดลมของ Power Supply", "ทำความสะอาดหน้าสัมผัส RAM ด้วยน้ำยา Contact Cleaner", "อัปเดตซอฟต์แวร์ BIOS ของเมนบอร์ดให้เป็นเวอร์ชันล่าสุด"] },
    { symptom: "เวลาและวันที่ของคอมพิวเตอร์รีเซ็ตใหม่ทุกครั้งที่เปิดเครื่อง", tool: "hw", toolHint: "🪛 ตรวจสอบกายภาพ: ตัวถ่านกระดุมบนเมนบอร์ดมีคราบออกไซด์", correct: "ซื้อแบตเตอรี่ CMOS (CR2032) ก้อนใหม่มาเปลี่ยนบนเมนบอร์ด", wrong: ["ปรับการตั้งค่า Time Zone ใน Windows ให้เป็น +07:00 Bangkok", "ลงระบบปฏิบัติการ Windows ใหม่เพื่อแก้ปัญหาไฟล์ Registry เสีย", "เข้าไปอัปเดตเฟิร์มแวร์ของ SSD ให้รองรับการบันทึกเวลา"] },
    { symptom: "เล่นเกมกราฟิกสูงแล้วเครื่องดับวูบไปเลยทันที", tool: "hw", toolHint: "🌡️ HWMonitor: อุณหภูมิ CPU และ GPU ปกติ ไม่เกิน 75°C", correct: "เปลี่ยน Power Supply ที่มีกำลังวัตต์ (Watt) สูงขึ้นให้พอกับระบบ", wrong: ["เพิ่มพัดลมระบายความร้อนในเคสเพื่อไล่อากาศร้อนออกไป", "เข้าไปตั้งค่า Task Manager เพื่อลดการใช้ทรัพยากรพื้นหลัง", "ถอด RAM แถวที่ 2 ออกเพื่อลดการกินกระแสไฟของระบบ"] },
    { symptom: "ไอคอน Wi-Fi หายไปจากแถบ Taskbar มุมขวาล่าง", tool: "task", toolHint: "📊 Device Manager: มีเครื่องหมายตกใจสีเหลืองที่ Network Adapter", correct: "คลิกขวาเลือก Update Driver หรือลงไดรเวอร์ Wi-Fi ใหม่", wrong: ["เปลี่ยนสายสัญญาณจอภาพและเช็กความละเอียดหน้าจอ", "ทำการ Clear CMOS เพื่อรีเซ็ตเมนบอร์ดให้เป็นค่าโรงงาน", "เปลี่ยนรหัสผ่านของเราเตอร์ Wi-Fi เพื่อป้องกันการโดนแฮก"] },
    { symptom: "เข้าเว็บไซต์บางเว็บได้ แต่บางเว็บขึ้น Error โหลดไม่ขึ้น", tool: "task", toolHint: "📊 ตรวจสอบ Command Prompt: ปิงหา 8.8.8.8 เจอปกติ", correct: "ตรวจสอบการตั้งค่า DNS Server หรือรีสตาร์ทเราเตอร์อินเทอร์เน็ต", wrong: ["ถอดฮาร์ดดิสก์ไปสแกนหาไวรัสกับคอมพิวเตอร์เครื่องอื่น", "เป่าฝุ่นทำความสะอาดช่องเสียบสาย LAN บนตัวเมนบอร์ด", "เพิ่มจำนวน RAM เพื่อให้เบราว์เซอร์มีพื้นที่โหลดหน้าเว็บ"] },
    { symptom: "เครื่องมีโฆษณาเด้งขึ้นมาเองที่มุมจอตลอดเวลา", tool: "task", toolHint: "📊 Task Manager: พบโปรแกรมชื่อแปลกๆ กิน CPU สูงในแท็บ Startup", correct: "ปิดโปรแกรมต้องสงสัยในแท็บ Startup และสแกนหา Malware", wrong: ["ฟอร์แมตฮาร์ดดิสก์ทิ้งทันทีเพื่อป้องกันไวรัสกระจายตัว", "ถอดซิงก์ CPU ออกมาทำความสะอาดเพื่อลดความร้อน", "เปลี่ยนสายสัญญาณอินเทอร์เน็ตเพื่อตัดการเชื่อมต่อจากแฮกเกอร์"] },
    { symptom: "เปิดคอมพิวเตอร์ขึ้นมาเจอหน้าจอให้โอนเงินค่าไถ่ข้อมูล", tool: "task", toolHint: "📊 สถานการณ์: ข้อมูลในเครื่องถูกเปลี่ยนนามสกุลเป็นแปลกๆ (Ransomware)", correct: "ตัดการเชื่อมต่อเครือข่ายทันที และเตรียมตัวลงระบบปฏิบัติการใหม่", wrong: ["ทำการทาซิลิโคน CPU ใหม่เพื่อให้เครื่องประมวลผลถอดรหัสได้ไวขึ้น", "รีบโอนเงินตามที่แฮกเกอร์เรียกร้องเพื่อความปลอดภัยของข้อมูล", "ใช้ยางลบขัดหน้าสัมผัส RAM และสลับช่องเสียบเพื่อรีเซ็ตระบบ"] },
    { symptom: "เสียบแฟลชไดรฟ์ที่ช่อง USB หน้าเคสแล้วไม่อ่าน", tool: "hw", toolHint: "🪛 ตรวจสอบกายภาพ: เสียบด้านหลังเมนบอร์ดอ่านข้อมูลได้ปกติ", correct: "เปิดฝาเคสตรวจสอบสาย Front Panel USB ว่าเสียบลงเมนบอร์ดแน่นไหม", wrong: ["อัปเดตระบบปฏิบัติการ Windows ให้รองรับพอร์ต USB 3.0", "เปลี่ยน Power Supply ตัวใหม่เพื่อให้จ่ายไฟไปหน้าเคสได้พอ", "โยนแฟลชไดรฟ์ทิ้งเพราะเกิดอาการไฟฟ้าสถิตจนชิปพังแล้ว"] },
    { symptom: "เสียบหูฟังที่ช่องหน้าเคสแล้วไม่มีเสียงออก", tool: "task", toolHint: "📊 Sound Settings: ระบบเลือก Output เป็นหน้าจอผ่านสาย HDMI อยู่", correct: "คลิกที่ไอคอนลำโพง แล้วเปลี่ยน Playback Device ให้เป็นช่องหูฟัง", wrong: ["ซื้อการ์ดเสียง (Sound Card) แบบแยกมาติดตั้งเพิ่มเติม", "แกะเคสออกมาตรวจสอบสายสัญญาณภาพว่าเสียบแน่นหรือไม่", "เปลี่ยนไดรเวอร์การ์ดจอให้เป็นเวอร์ชันเก่าเพื่อแก้ปัญหาเสียง"] },
    { symptom: "คอมพิวเตอร์ทำงานปกติ แต่ไฟ RGB ที่พัดลมเคสไม่ติด", tool: "hw", toolHint: "🪛 ตรวจสอบกายภาพ: พัดลมหมุนปกติ แต่สายไฟเส้นเล็กๆ หลุดอยู่", correct: "ตรวจสอบสาย ARGB 5V หรือ 12V RGB ว่าเสียบลงกล่องคอนโทรลเลอร์หรือไม่", wrong: ["เปลี่ยน Power Supply เพราะไฟไม่พอเลี้ยงระบบแสงสว่าง", "อัปเดต BIOS เพื่อปลดล็อกฟีเจอร์แสงไฟสเปกตรัม", "ถอดพัดลมไปล้างน้ำทำความสะอาดแผงวงจรควบคุมไฟ"] },
    { symptom: "ประกอบคอมใหม่ เปิดติด แต่ไฟ Debug LED ค้างที่ CPU และ RAM สลับกัน", tool: "hw", toolHint: "🪛 ตรวจสอบกายภาพ: พบรอยงอที่ขา Socket ของเมนบอร์ดบริเวณใกล้ๆ CPU", correct: "ส่งเคลมเมนบอร์ด หรือใช้เข็มเขี่ยดัดขา Socket กลับมาอย่างระมัดระวัง", wrong: ["เข้าไปปรับความเร็วรอบพัดลม CPU ใน BIOS ให้หมุนเต็ม 100%", "ใช้ยางลบขัดหน้าสัมผัส CPU และ RAM อย่างรุนแรงเพื่อขจัดคราบ", "ดาวน์โหลดไดรเวอร์เมนบอร์ดมาติดตั้งผ่านทางแฟลชไดรฟ์"] },
    { symptom: "กดเปิดเครื่อง พัดลมกระตุก 1 วินาทีแล้วนิ่ง ไฟไม่เข้าอีกเลย", tool: "hw", toolHint: "🔌 เช็กสายไฟ: เมื่อถอดสายไฟเลี้ยงการ์ดจอออก เครื่องเปิดติดปกติ", correct: "ภาคจ่ายไฟของการ์ดจอช็อต ต้องส่งซ่อมวงจรการ์ดแสดงผล", wrong: ["Power Supply เสียหายอย่างหนัก ต้องซื้อเปลี่ยนใหม่ทันที", "ถ่าน BIOS หมดอายุการใช้งาน ทำให้วงจรเริ่มการบูตล้มเหลว", "แรมเกิดไฟฟ้าสถิต ต้องถอดมาขัดและสลับช่องเสียบใหม่"] },
    { symptom: "เครื่องค้าง (Freeze) ขยับเมาส์ไม่ได้ ต้องกดปุ่ม Power แช่เพื่อปิด", tool: "task", toolHint: "📊 Event Viewer: พบข้อความ Kernel-Power Error 41", correct: "ตรวจสอบสภาพ Power Supply และตั้งค่าปิด Fast Startup ใน Windows", wrong: ["เปลี่ยนสายสัญญาณภาพ (HDMI) เป็นสาย DisplayPort แทน", "เข้าเซฟโหมดเพื่อทำการลบไดรเวอร์เสียง (Audio) ออกทั้งหมด", "เป่าฝุ่นฮาร์ดดิสก์และขยับสาย SATA ให้แน่นหนายิ่งขึ้น"] },
    { symptom: "เวลาใช้งานโปรแกรมหนักๆ จอจะดับไป 2 วินาทีแล้วติดขึ้นมาใหม่", tool: "hw", toolHint: "🌡️ HWMonitor: อุณหภูมิการ์ดจอปกติ แต่สายอแดปเตอร์จอภาพร้อนมาก", correct: "เปลี่ยนอแดปเตอร์หรือสายไฟของจอภาพ (Monitor Power Adapter)", wrong: ["อัปเกรด RAM เพื่อให้รองรับการประมวลผลกราฟิกที่หนักขึ้น", "เปลี่ยนการ์ดจอตัวใหม่เนื่องจากชิป VRAM เสื่อมสภาพ", "ทาซิลิโคนระบายความร้อนบนชิปเซตของเมนบอร์ดใหม่"] },
    { symptom: "เข้าหน้า BIOS ได้ปกติ แต่พอจะโหลดเข้า Windows เครื่องจะรีสตาร์ทเองเสมอ", tool: "led", toolHint: "💡 Debug LED: ไฟวิ่งผ่านครบ 4 ดวงปกติ แต่รีสตาร์ทวนลูป", correct: "ใช้ USB Bootable ทำการซ่อมแซม Windows (Startup Repair)", wrong: ["เปลี่ยน Power Supply เนื่องจากจ่ายไฟช่วงโหลดเข้าระบบไม่พอ", "สลับช่องเสียบ RAM เพื่อแก้ปัญหาคอขวดของการโอนถ่ายข้อมูล", "เคลียร์ CMOS เพื่อล้างรหัสผ่านและค่าโรงงานของเมนบอร์ด"] }
];

// --- ระบบ Custom Alert (แทนที่ Alert พื้นฐานของ Browser) ---
let alertCallback = null;
window.showAlert = function(title, message, icon = "👨‍💻", callback = null) {
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-message').innerHTML = message.replace(/\n/g, '<br>');
    document.getElementById('custom-alert').classList.remove('hidden');
    alertCallback = callback;
};

window.closeAlert = function() {
    document.getElementById('custom-alert').classList.add('hidden');
    if (alertCallback) {
        alertCallback();
        alertCallback = null;
    }
};
// --------------------------------------------------------

// ฟังก์ชันพิมพ์ข้อความลงหน้าจอ CMD
function logCMD(msg, type = "normal") {
    const cmdBox = document.getElementById('cmd-terminal');
    if (!cmdBox) return;
    
    const line = document.createElement('div');
    line.className = 'cmd-line';
    
    const time = new Date().toLocaleTimeString('th-TH', { hour12: false });
    let prefix = `[${time}] root@DiagOS> `;
    
    if (type === "error") line.className += ' cmd-error';
    if (type === "success") line.className += ' cmd-success';
    if (type === "warn") line.className += ' cmd-warn';
    
    line.innerText = prefix + msg;
    cmdBox.appendChild(line);
    cmdBox.scrollTop = cmdBox.scrollHeight;
}

// ฟังก์ชันเริ่มเกม
window.startGame = function() {
    const inputName = document.getElementById('shop-name-input').value.trim();
    if (inputName.length < 2) { 
        showAlert("ข้อผิดพลาด", "กรุณาตั้งชื่อร้านให้มีความยาว 2 ตัวอักษรขึ้นไปครับ!", "⚠️"); 
        return; 
    }
    
    shopName = inputName;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    gamePool = masterCasePool.sort(() => 0.5 - Math.random()).slice(0, maxCases);
    gold -= 10;
    
    updateUI();
    
    if (typeof window.syncDataToServer === 'function') {
        window.syncDataToServer(shopName, stars, gold);
    }
    
    logCMD("SYSTEM INITIALIZED. WELCOME, TECH " + shopName.toUpperCase(), "success");
    loadCase();
};

function loadCase() {
    if (currentCaseNum > maxCases) {
        showAlert("รายงานการประเมินผล", `🎉 จบกะการทำงาน!\nคุณทำได้ ${stars} ดาว\nเริ่มกะใหม่เพื่อสะสมดาวและเงินต่อ!`, "🏆", () => {
            currentCaseNum = 1;
            gamePool = masterCasePool.sort(() => 0.5 - Math.random()).slice(0, maxCases);
            gold -= 10;
            document.getElementById('cmd-terminal').innerHTML = '';
            logCMD("STARTING NEW SHIFT...", "warn");
            renderCase();
        });
        return;
    }
    renderCase();
}

function renderCase() {
    currentCaseData = gamePool[currentCaseNum - 1];
    document.getElementById('case-title').innerText = `📋 เคสที่ ${currentCaseNum}/${maxCases} (หักค่าเช่าร้าน -$10)`;
    document.getElementById('case-symptom').innerText = currentCaseData.symptom;
    document.getElementById('clue-display').innerText = "รอกดใช้เครื่องมือวิเคราะห์...";
    document.getElementById('clue-display').style.color = "var(--text-muted)"; // สีเทาเริ่มต้น
    
    logCMD(`--------------------------------`);
    logCMD(`LOADING CASE ${currentCaseNum}...`);
    logCMD(`SYMPTOM: ${currentCaseData.symptom}`, "warn");
    logCMD(`AWAITING DIAGNOSTIC TOOLS...`);

    const options = [currentCaseData.correct, ...currentCaseData.wrong].sort(() => 0.5 - Math.random());
    const actionDiv = document.getElementById('action-buttons');
    actionDiv.innerHTML = '';
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "btn btn-outline answer-btn";
        btn.innerText = opt;
        btn.onclick = () => takeAction(opt, btn);
        actionDiv.appendChild(btn);
    });

    updateUI();
}

window.useTool = function(toolType) {
    if (energy < 10) { 
        logCMD("ERROR: INSUFFICIENT ENERGY TO RUN TOOL!", "error");
        showAlert("พลังงานไม่เพียงพอ", "พลังงานไม่พอ! ไปเบิก Energy Drink ที่ร้านค้า", "🔋"); 
        return; 
    }
    energy -= 10;
    
    logCMD(`EXECUTING TOOL: [${toolType.toUpperCase()}]...`);
    
    const clueBox = document.getElementById('clue-display');
    // เปลี่ยนเป็นสีฟ้าเทคนิค เพื่อซ่อนสัญลักษณ์ถูกผิด เด็กต้องอ่านข้อความอย่างเดียว
    clueBox.style.color = "#38bdf8"; 

    if (toolType === currentCaseData.tool) {
        clueBox.innerText = currentCaseData.toolHint;
        // พิมพ์ลง CMD เป็นสีเขียวปกติ
        logCMD(`> SYSTEM REPORT: ${currentCaseData.toolHint}`);
    } else {
        const normalMsg = normalToolMessages[toolType] || "ระบบทำงานปกติ ไม่พบข้อผิดพลาด";
        clueBox.innerText = normalMsg;
        // พิมพ์ลง CMD เป็นสีเขียวปกติเหมือนกัน
        logCMD(`> SYSTEM REPORT: ${normalMsg} (-10% ENERGY)`);
    }
    updateUI();
};

function takeAction(selectedOpt, btnElement) {
    document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
    logCMD(`APPLYING FIX: ${selectedOpt}...`);

    if (selectedOpt === currentCaseData.correct) {
        btnElement.classList.replace('btn-outline', 'btn-success');
        logCMD("SYSTEM RESTORED! DIAGNOSIS CORRECT.", "success");
        
        // ลดดีเลย์เหลือ 0.8 วินาที (เร็วขึ้น 2.5 เท่า)
        setTimeout(() => {
            gold += 50;
            stars += 1;
            if (typeof window.syncDataToServer === 'function') {
                window.syncDataToServer(shopName, stars, gold);
            }
            currentCaseNum++;
            loadCase();
        }, 800); 
    } else {
        btnElement.classList.replace('btn-outline', 'btn-danger');
        
        if (shields > 0) {
            shields--;
            logCMD("CRITICAL FAILURE PREVENTED: INSURANCE SHIELD DEPLOYED.", "warn");
            showAlert("ระบบประกันภัย", "🛡️ โล่ประกันทำงาน! คุณรอดจากการโดนหักพลังงาน", "🛡️");
        } else {
            energy -= 20;
            logCMD("INCORRECT FIX APPLIED. SYSTEM DAMAGED! (-20% ENERGY)", "error");
        }
        
        if (energy <= 0) {
            logCMD("FATAL ERROR: SYSTEM OFFLINE. REBOOTING...", "error");
            
            let starLostMsg = "";
            if (stars > 0) {
                stars -= 1;
                starLostMsg = "📉 คุณโดนหัก -1 ดาว เนื่องจากแก้ไขปัญหาผิดพลาดจนเครื่องพัง!";
                logCMD("PENALTY APPLIED: -1 STAR RANK DOWN", "error");
            } else {
                starLostMsg = "📉 ดาวของคุณเป็น 0 อยู่แล้ว (ไม่ถูกหักเพิ่ม)";
            }

            showAlert("ผู้ประเมินระบบ (ล้มเหลว)", `💀 พลังงานหมด! ลูกค้าไม่พอใจอย่างมาก\n${starLostMsg}\n\nระบบจะทำการรีบูตเริ่มกะใหม่ให้ทันที`, "💀", () => {
                energy = 100;
                currentCaseNum = 1;
                gamePool = masterCasePool.sort(() => 0.5 - Math.random()).slice(0, maxCases);
                gold -= 10; 
                
                if (typeof window.syncDataToServer === 'function') {
                    window.syncDataToServer(shopName, stars, gold);
                }

                document.getElementById('cmd-terminal').innerHTML = '';
                logCMD("SYSTEM REBOOTED. NEW SHIFT STARTED.", "warn");
                document.querySelectorAll('.answer-btn').forEach(b => b.disabled = false);
                updateUI();
                renderCase();
            });

        } else {
            // ลดดีเลย์เหลือ 0.6 วินาที (เร็วขึ้น 2.5 เท่า)
            setTimeout(() => {
                btnElement.classList.replace('btn-danger', 'btn-outline');
                document.querySelectorAll('.answer-btn').forEach(b => b.disabled = false);
                updateUI();
            }, 600);
        }
    }
}

function updateUI() {
    document.getElementById('display-shop-name').innerText = shopName;
    document.getElementById('display-stars').innerText = stars;
    document.getElementById('display-energy').innerText = energy;
    document.getElementById('display-gold').innerText = gold;
    document.getElementById('shop-gold').innerText = gold;
    document.getElementById('display-shield').innerText = shields;
    
   let rank = "Bronze";

if (stars >= 50) {
    rank = "Conqueror";
} else if (stars >= 30) {
    rank = "Diamond";
} else if (stars >= 20) {
    rank = "Platinum";
} else if (stars >= 15) {
    rank = "Gold";
} else if (stars >= 10) {
    rank = "Silver";
}

document.getElementById('display-rank').innerText = rank;
}

window.toggleShop = function() {
    const shop = document.getElementById('shop-screen');
    shop.classList.toggle('hidden');
};

window.buyItem = function(type, price, val) {
    if (gold < price) { 
        showAlert("ฝ่ายการเงิน", "เงินไม่พอเบิกอุปกรณ์ครับช่าง!", "💸"); 
        return; 
    }
    
    gold -= price;
    if (type === 'energy') { 
        energy = Math.min(100, energy + val); 
        logCMD("ITEM PURCHASED: ENERGY DRINK", "success");
    }
    if (type === 'shield') { 
        shields++; 
        logCMD("ITEM PURCHASED: INSURANCE SHIELD", "success");
    }
    if (type === 'ai') {
        logCMD("ITEM PURCHASED: AI DIAGNOSTIC APPLIED", "warn");
        const btns = document.querySelectorAll('.answer-btn');
        let removed = false;
        btns.forEach(b => {
            if (!removed && !b.disabled && b.innerText !== currentCaseData.correct) {
                b.style.opacity = '0.3';
                b.disabled = true;
                removed = true;
            }
        });
        toggleShop();
    }
    updateUI();
    if (typeof window.syncDataToServer === 'function') {
        window.syncDataToServer(shopName, stars, gold);
    }
};

// ป้องกันการกด F12 และคลิกขวา (ซ่อนโค้ด)
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.keyCode == 123) return false;
    if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) return false;
    if (e.ctrlKey && e.keyCode == 85) return false;
};
